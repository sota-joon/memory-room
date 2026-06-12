"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Download,
  FileAudio,
  Mic,
  Music2,
  Play,
  Copy,
  RotateCcw,
  Save,
  Share2,
  Sparkles,
  Square,
  Video,
  Volume2,
} from "lucide-react";
import {
  createAudioFileName,
  startAudioRecorder,
  stopAudioStream,
  type AudioRecorderSession,
} from "../lib/audioRecorder";
import {
  createStudioOutputs,
  createStudioQuestion,
  getStudioConfig,
  getStudioKind,
  type StudioProfile,
} from "../lib/studioProducts";
import { startVideoRecorder, stopStream, type VideoRecorderSession } from "../lib/videoRecorder";
import { cancelSpeech, speakKorean } from "../lib/speech";
import { clearKioskAppStorage, isKioskMode, purgeKioskBrowserData } from "../lib/kioskMode";
import { transcribeAudioWithServer } from "../lib/serverStt";
import {
  createKoreanSpeechRecognition,
  diagnoseSpeechRecognitionAccess,
  getSpeechRecognitionFallbackMessage,
  getSpeechRecognitionStartErrorMessage,
  getUnsupportedSpeechRecognitionMessage,
  isSpeechRecognitionSupported,
  type SpeechRecognitionController,
} from "../lib/speechRecognition";
import type { ContentType, Locale } from "../lib/types";

type Props = {
  contentType: ContentType;
  locale: Locale;
  onBack: () => void;
};

type StudioStep = "setup" | "production" | "interview" | "preview";

type Dialogue = {
  answer?: string;
  question: string;
};

const emptyProfile: StudioProfile = {
  age: "",
  mood: "",
  name: "",
  occupation: "",
  output: "",
  relationship: "",
  target: "",
  topic: "",
  visibility: "",
};

export function StudioExperience({ contentType, locale, onBack }: Props) {
  const config = getStudioConfig(contentType);
  const kind = getStudioKind(contentType);
  const copy = studioCopy[locale];
  const [step, setStep] = useState<StudioStep>("setup");
  const [profile, setProfile] = useState<StudioProfile>(emptyProfile);
  const [dialogues, setDialogues] = useState<Dialogue[]>([]);
  const [answer, setAnswer] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [mrFileName, setMrFileName] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [vaultUrl, setVaultUrl] = useState("");
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [isQuestionSpeaking, setIsQuestionSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSavingVault, setIsSavingVault] = useState(false);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const audioRef = useRef<AudioRecorderSession | null>(null);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionController | null>(null);
  const recognitionBaseAnswerRef = useRef("");
  const videoRef = useRef<VideoRecorderSession | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  const outputs = useMemo(
    () => createStudioOutputs(kind, profile, dialogues.map((dialogue) => dialogue.answer || "")),
    [dialogues, kind, profile],
  );

  useEffect(() => {
    if (window.location.pathname === "/") {
      window.history.replaceState(null, "", `/?studio=${contentType}`);
    }
    if (isKioskMode()) {
      purgeKioskBrowserData();
      return () => {
        cancelSpeech();
        recognitionRef.current?.stop();
        stopAudioStream(audioRef.current?.stream ?? null);
        stopStream(previewStream);
      };
    }
    const stored = window.localStorage.getItem(`memoryVaultStudio:${contentType}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { dialogues?: Dialogue[]; profile?: StudioProfile; step?: StudioStep };
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.dialogues) setDialogues(parsed.dialogues);
        if (parsed.step) setStep(parsed.step);
      } catch {
        // Ignore malformed local MVP drafts.
      }
    }

    return () => {
      cancelSpeech();
      recognitionRef.current?.stop();
      stopAudioStream(audioRef.current?.stream ?? null);
      stopStream(previewStream);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentType]);

  useEffect(() => {
    if (!videoPreviewRef.current) return;
    videoPreviewRef.current.srcObject = previewStream;
  }, [previewStream]);

  useEffect(() => {
    if (isKioskMode()) return;
    window.localStorage.setItem(
      `memoryVaultStudio:${contentType}`,
      JSON.stringify({ contentType, dialogues, profile, step, updatedAt: new Date().toISOString() }),
    );
  }, [contentType, dialogues, profile, step]);

  function updateProfile(field: keyof StudioProfile, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function submitSetup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStep("production");
  }

  function startInterview() {
    const firstQuestion = createStudioQuestion(kind, profile, []);
    setDialogues([{ question: firstQuestion }]);
    setStep("interview");
    speakStudioQuestion(firstQuestion);
  }

  function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!answer.trim()) return;

    recognitionRef.current?.stop();
    setIsListening(false);

    const answered = dialogues.map((dialogue, index) =>
      index === dialogues.length - 1 ? { ...dialogue, answer: answer.trim() } : dialogue,
    );
    const answers = answered.map((dialogue) => dialogue.answer || "").filter(Boolean);

    if (answers.length >= 3) {
      setDialogues(answered);
      setAnswer("");
      setStep("preview");
      return;
    }

    const nextQuestion = createStudioQuestion(kind, profile, answers);
    setDialogues([...answered, { question: nextQuestion }]);
    setAnswer("");
    speakStudioQuestion(nextQuestion);
  }

  async function toggleSpeechRecognition() {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setMessage(getUnsupportedSpeechRecognitionMessage());
      return;
    }

    setMessage("마이크 권한과 음성인식 지원 상태를 확인하고 있습니다...");
    const diagnostics = await diagnoseSpeechRecognitionAccess(true);
    const fallbackMessage = getSpeechRecognitionFallbackMessage(diagnostics);
    if (fallbackMessage) {
      setMessage(fallbackMessage);
      return;
    }

    const controller = createKoreanSpeechRecognition({
      onEnd: () => setIsListening(false),
      onError: (nextMessage) => setMessage(nextMessage),
      onResult: appendRecognizedAnswer,
      onStart: () => {
        setMessage("음성 입력 중입니다. 말한 내용이 답변창에 자동으로 입력됩니다.");
        setIsListening(true);
      },
    });

    if (!controller) return;

    try {
      setMessage("음성인식을 시작합니다...");
      recognitionBaseAnswerRef.current = answer.trim();
      recognitionRef.current = controller;
      controller.start();
    } catch (error) {
      console.error("[Memory Room] recognition.start failed", error);
      setMessage(getSpeechRecognitionStartErrorMessage(error));
      setIsListening(false);
    }
  }

  function appendRecognizedAnswer(text: string, isFinal: boolean) {
    const cleanText = text.trim();
    if (!cleanText) return;

    const baseAnswer = recognitionBaseAnswerRef.current.trim();
    const nextAnswer = baseAnswer ? `${baseAnswer} ${cleanText}` : cleanText;
    setAnswer(nextAnswer);

    if (isFinal) {
      recognitionBaseAnswerRef.current = nextAnswer;
    }
  }

  async function saveStudioMemory() {
    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError("올바른 이메일을 입력해주세요.");
      return;
    }

    setEmailError("");
    setMessage("");
    setIsSavingVault(true);

    try {
      const response = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: outputs.title,
          recipient: profile.target || profile.name || null,
          messageText: `${outputs.summary}\n\n${outputs.cards.map((card) => `${card.title}\n${card.body}`).join("\n\n")}`,
          selectedQuestions: dialogues.map((dialogue) => dialogue.question),
          answers: dialogues.map((dialogue) => dialogue.answer || ""),
          audioUrl: null,
          email: trimmedEmail,
        }),
      });
      const result = (await response.json()) as { error?: string; url?: string };
      if (!response.ok || !result.url) {
        throw new Error(result.error || "결과물 저장에 실패했습니다.");
      }

      const absoluteUrl = new URL(result.url, window.location.origin).toString();
      setVaultUrl(absoluteUrl);
      setMessage("기록이 저장되었습니다. 아래 링크로 나중에 다시 확인할 수 있습니다.");
    } catch (error) {
      setEmailError(error instanceof Error ? error.message : "결과물 저장에 실패했습니다.");
    } finally {
      setIsSavingVault(false);
    }
  }

  async function copyVaultLink() {
    if (!vaultUrl) return;
    await navigator.clipboard.writeText(vaultUrl);
    setMessage("링크를 복사했습니다.");
  }

  function speakStudioQuestion(question: string) {
    if (!question) return;
    speakKorean(question, {
      onEnd: () => setIsQuestionSpeaking(false),
      onStart: () => setIsQuestionSpeaking(true),
    });
  }

  async function toggleAudioRecording() {
    if (isAudioRecording) {
      const recorder = audioRef.current;
      if (!recorder) return;
      setIsAudioRecording(false);
      setMessage(copy.audioPreparing);
      const blob = await recorder.stop();
      audioRef.current = null;
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioBlob(blob);
      setAudioUrl(URL.createObjectURL(blob));
      setMessage(copy.audioReady);
      return;
    }

    try {
      setMessage(copy.microphonePrompt);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl("");
      }
      setAudioBlob(null);
      audioRef.current = await startAudioRecorder();
      setIsAudioRecording(true);
      setMessage(copy.audioRecordingStarted);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.audioError);
    }
  }

  function playRecordedAudio() {
    audioPlaybackRef.current?.play().catch(() => {
      setMessage(copy.audioPlaybackError);
    });
  }

  function resetAudioRecording() {
    if (isAudioRecording) return;
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl("");
    setMessage("");
  }

  async function transcribeRecordedAudio() {
    if (!audioBlob) {
      setMessage("변환할 녹음 파일이 없습니다. 먼저 마이크 녹음을 완료해주세요.");
      return;
    }

    try {
      setMessage("녹음 파일을 텍스트로 변환하는 서버 STT를 호출하고 있습니다...");
      const result = await transcribeAudioWithServer({ audio: audioBlob, language: "ko" });
      setAnswer((current) => (current.trim() ? `${current.trimEnd()} ${result.text}` : result.text));
      setMessage(`${result.provider} 변환 결과를 답변창에 넣었습니다.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "음성을 텍스트로 변환하지 못했습니다.");
    }
  }

  async function toggleVideoRecording() {
    if (isVideoRecording) {
      const recorder = videoRef.current;
      if (!recorder) return;
      setIsVideoRecording(false);
      setMessage(copy.videoPreparing);
      const blob = await recorder.stop();
      videoRef.current = null;
      setPreviewStream(null);
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      setVideoUrl(URL.createObjectURL(blob));
      setMessage(copy.videoReady);
      return;
    }

    try {
      setMessage(copy.cameraPrompt);
      const recorder = await startVideoRecorder();
      videoRef.current = recorder;
      setPreviewStream(recorder.stream);
      setIsVideoRecording(true);
      setMessage(copy.videoRecordingStarted);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.videoError);
    }
  }

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="studio-shell"
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="studio-topbar">
        <button className="secondary-button compact" type="button" onClick={onBack}>
          <ArrowLeft size={17} aria-hidden="true" />
          {copy.back}
        </button>
        <span>{copy.routeLabel} / {config.studioTitle}</span>
      </div>

      <div className="studio-hero">
        <p className="eyebrow">{copy.brandLine}</p>
        <h1>{config.studioTitle}</h1>
        <p>{config.description}</p>
        <div className="studio-role-row">
          <span><Sparkles size={15} aria-hidden="true" /> {config.producerRole}</span>
          <span>{copy.mode}: {recordModeLabel[locale][config.recordMode]}</span>
        </div>
      </div>

      {step === "setup" && (
        <form className="studio-layout" onSubmit={submitSetup}>
          <section className="studio-stage-panel">
            <p className="eyebrow">{copy.stepOne}</p>
            <h2>{config.setupTitle}</h2>
            <p>{copy.setupBody}</p>
          </section>
          <div className="studio-form-grid">
            {config.fields.includes("name") && <StudioInput label={copy.name} value={profile.name} onChange={(value) => updateProfile("name", value)} placeholder={copy.namePlaceholder} required />}
            {config.fields.includes("age") && <StudioInput label={copy.age} value={profile.age} onChange={(value) => updateProfile("age", value)} placeholder="32" />}
            {config.fields.includes("target") && <StudioInput label={copy.target} value={profile.target} onChange={(value) => updateProfile("target", value)} placeholder={copy.targetPlaceholder} />}
            {config.fields.includes("relationship") && <StudioInput label={copy.relationship} value={profile.relationship} onChange={(value) => updateProfile("relationship", value)} placeholder={copy.relationshipPlaceholder} />}
            {config.fields.includes("occupation") && <StudioInput label={copy.occupation} value={profile.occupation} onChange={(value) => updateProfile("occupation", value)} placeholder={copy.occupationPlaceholder} />}
            {config.fields.includes("topic") && <StudioInput label={topicLabel[kind][locale]} value={profile.topic} onChange={(value) => updateProfile("topic", value)} placeholder={topicPlaceholder[kind][locale]} required />}
            {config.fields.includes("mood") && <StudioInput label={copy.mood} value={profile.mood} onChange={(value) => updateProfile("mood", value)} placeholder={copy.moodPlaceholder} />}
            {config.fields.includes("visibility") && <StudioInput label={copy.visibility} value={profile.visibility} onChange={(value) => updateProfile("visibility", value)} placeholder={copy.visibilityPlaceholder} />}
            {config.fields.includes("output") && <StudioInput label={copy.output} value={profile.output} onChange={(value) => updateProfile("output", value)} placeholder={copy.outputPlaceholder} />}
          </div>
          <div className="button-row soft-center studio-wide-action">
            <button className="primary-button compact" type="submit">
              {copy.prepareStudio}
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </form>
      )}

      {step === "production" && (
        <section className="studio-layout">
          <div className="studio-stage-panel">
            <p className="eyebrow">{copy.stepTwo}</p>
            <h2>{config.sessionTitle}</h2>
            <p>{productionIntro[kind][locale]}</p>
          </div>

          <div className="studio-control-board">
            <div className="studio-permission-note">
              <p>{copy.permissionGuide}</p>
            </div>

            {(kind === "kpop") && (
              <div className="studio-control-card studio-accent-card">
                <Music2 size={28} aria-hidden="true" />
                <h3>{copy.songSelect}</h3>
                <p>{copy.songSelectBody}</p>
                <label className="upload-zone">
                  <FileAudio size={20} aria-hidden="true" />
                  <span>{mrFileName || copy.uploadMr}</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(event) => setMrFileName(event.target.files?.[0]?.name ?? "")}
                  />
                </label>
              </div>
            )}

            {(config.recordMode === "audio" || config.recordMode === "mixed") && (
              <div className="studio-control-card">
                <Mic size={28} aria-hidden="true" />
                <h3>{copy.audioRecord}</h3>
                <p>{copy.audioBody}</p>
                <p className={`recording-state ${isAudioRecording ? "is-recording" : ""}`}>
                  {isAudioRecording ? copy.recordingNow : audioUrl ? copy.recordingReady : copy.recordingIdle}
                </p>
                <button className={`secondary-button ${isAudioRecording ? "recording-button" : ""}`} type="button" onClick={toggleAudioRecording}>
                  {isAudioRecording ? <Square size={17} aria-hidden="true" /> : <Mic size={17} aria-hidden="true" />}
                  {isAudioRecording ? copy.stopAudio : copy.startAudio}
                </button>
                {audioUrl && (
                  <div className="studio-media-preview">
                    <audio ref={audioPlaybackRef} src={audioUrl} controls preload="metadata" />
                    <div className="audio-action-row">
                      <button className="secondary-button compact" type="button" onClick={playRecordedAudio}>
                        <Play size={16} aria-hidden="true" />
                        {copy.listenAudio}
                      </button>
                      <button className="secondary-button compact" type="button" onClick={resetAudioRecording}>
                        <RotateCcw size={16} aria-hidden="true" />
                        {copy.recordAgain}
                      </button>
                      <button className="secondary-button compact" type="button" onClick={transcribeRecordedAudio}>
                        녹음 텍스트 변환
                      </button>
                    </div>
                    <a className="secondary-button download-link" href={audioUrl} download={createAudioFileName(profile.name)}>
                      <Download size={16} aria-hidden="true" />
                      {copy.downloadAudio}
                    </a>
                  </div>
                )}
              </div>
            )}

            {(config.recordMode === "video" || config.recordMode === "mixed") && (
              <div className="studio-control-card">
                <Camera size={28} aria-hidden="true" />
                <h3>{copy.videoRecord}</h3>
                <p>{copy.videoBody}</p>
                <p className={`recording-state ${isVideoRecording ? "is-recording" : ""}`}>
                  {isVideoRecording ? copy.videoRecordingNow : videoUrl ? copy.videoRecordingReady : copy.videoRecordingIdle}
                </p>
                <button className={`secondary-button ${isVideoRecording ? "recording-button" : ""}`} type="button" onClick={toggleVideoRecording}>
                  {isVideoRecording ? <Square size={17} aria-hidden="true" /> : <Video size={17} aria-hidden="true" />}
                  {isVideoRecording ? copy.stopVideo : copy.startVideo}
                </button>
                {previewStream && <video className="video-preview" ref={videoPreviewRef} autoPlay muted playsInline />}
                {videoUrl && (
                  <div className="studio-media-preview">
                    <video className="video-preview" src={videoUrl} controls playsInline />
                    <a className="secondary-button download-link" href={videoUrl} download={`memory-vault-video-${profile.name || "guest"}.webm`}>
                      <Download size={16} aria-hidden="true" />
                      {copy.downloadVideo}
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="studio-control-card">
              <Sparkles size={28} aria-hidden="true" />
              <h3>{copy.aiInterviewReady}</h3>
              <p>{copy.aiInterviewBody}</p>
              <button className="primary-button compact" type="button" onClick={startInterview}>
                {copy.startInterview}
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          </div>

          {message && <p className="helper-message centered-message">{message}</p>}
        </section>
      )}

      {step === "interview" && (
        <section className="studio-layout">
          <div className="studio-stage-panel">
            <p className="eyebrow">{copy.stepThree}</p>
            <h2>{copy.aiConversation}</h2>
            <p>{copy.dialogueBody}</p>
          </div>

          <div className="dialogue-room">
            {dialogues.map((dialogue, index) => (
              <div className="dialogue-turn" key={`${dialogue.question}-${index}`}>
                <p className="eyebrow">{config.producerRole}</p>
                <p>{dialogue.question}</p>
                {dialogue.answer && <blockquote>{dialogue.answer}</blockquote>}
              </div>
            ))}

            <form className="dialogue-answer" onSubmit={submitAnswer}>
              <button
                className={`secondary-button compact ${isQuestionSpeaking ? "recording-button" : ""}`}
                type="button"
                onClick={() => speakStudioQuestion(dialogues[dialogues.length - 1]?.question ?? "")}
              >
                <Volume2 size={17} aria-hidden="true" />
                {isQuestionSpeaking ? copy.questionSpeaking : copy.listenQuestion}
              </button>
              <button
                className={`secondary-button compact ${isListening ? "recording-button" : ""}`}
                type="button"
                onClick={toggleSpeechRecognition}
              >
                <Mic size={17} aria-hidden="true" />
                {isListening ? "음성 입력 중지" : "음성 입력 시작"}
              </button>
              <textarea
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder={copy.answerPlaceholder}
                required
              />
              <button className="primary-button compact" type="submit">
                {dialogues.filter((dialogue) => dialogue.answer).length >= 2 ? copy.finishInterview : copy.sendAnswer}
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </form>
          </div>
        </section>
      )}

      {step === "preview" && (
        <section className="studio-layout">
          <div className="studio-stage-panel">
            <p className="eyebrow">{copy.stepFour}</p>
            <h2>{outputs.title}</h2>
            <p>{outputs.summary}</p>
            <div className="emotion-tag-row">
              {outputs.emotionTags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          </div>

          <div className="studio-result-grid">
            {outputs.cards.map((card) => (
              <article className="studio-result-card" key={`${card.label}-${card.title}`}>
                <p className="eyebrow">{card.label}</p>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
            {(audioUrl || videoUrl) && (
              <article className="studio-result-card media-result-card">
                <p className="eyebrow">{copy.recordedMedia}</p>
                {audioUrl && <audio src={audioUrl} controls />}
                {videoUrl && <video className="video-preview" src={videoUrl} controls playsInline />}
              </article>
            )}
          </div>

          <section className="settings-panel">
            <div>
              <p className="eyebrow">결과물 저장</p>
              <h2>나중에 다시 볼 수 있게 저장합니다.</h2>
              <p className="helper-message">
                이 기기에는 기록이 저장되지 않습니다. 이메일을 입력하면 고유 링크를 생성합니다.
              </p>
            </div>
            <div className="form-grid">
              <label>
                이메일
                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setEmailError("");
                  }}
                  placeholder="결과물을 받을 이메일을 입력해주세요"
                />
              </label>
            </div>
            {emailError && <p className="helper-message centered-message">{emailError}</p>}
            {vaultUrl && (
              <div className="summary-panel">
                <p className="eyebrow">저장 완료</p>
                <p>기록이 저장되었습니다. 아래 링크로 나중에 다시 확인할 수 있습니다.</p>
                <a className="download-link" href={vaultUrl} target="_blank" rel="noreferrer">
                  {vaultUrl}
                </a>
              </div>
            )}
          </section>

          <div className="button-row soft-center sticky-actions">
            <button className="secondary-button" type="button" onClick={() => setStep("interview")}>
              {copy.refine}
            </button>
            <button className="secondary-button" type="button" onClick={() => window.print()}>
              <Download size={17} aria-hidden="true" />
              PDF
            </button>
            <button className="primary-button compact" type="button" disabled={isSavingVault} onClick={saveStudioMemory}>
              <Save size={17} aria-hidden="true" />
              {isSavingVault ? "저장 중..." : "결과물 저장하기"}
            </button>
            {vaultUrl && (
              <>
                <a className="primary-button compact download-link" href={vaultUrl} target="_blank" rel="noreferrer">
                  결과물 다시 보기
                </a>
                <button className="secondary-button" type="button" onClick={copyVaultLink}>
                  <Copy size={17} aria-hidden="true" />
                  링크 복사하기
                </button>
                <button className="secondary-button" type="button" onClick={onBack}>
                  메인으로 돌아가기
                </button>
              </>
            )}
            {!vaultUrl && (
              <button className="primary-button compact" type="button" onClick={() => navigator.share?.({ title: outputs.title, text: outputs.coreSentence }).catch(() => setMessage(copy.shareFallback))}>
                <Share2 size={17} aria-hidden="true" />
                {copy.share}
              </button>
            )}
          </div>
          {message && <p className="helper-message centered-message">{message}</p>}
        </section>
      )}
    </motion.section>
  );
}

function StudioInput({
  label,
  onChange,
  placeholder,
  required = false,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  value: string;
}) {
  return (
    <label>
      {label}
      <input required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

const recordModeLabel = {
  ko: { audio: "오디오", conversation: "AI 대화", mixed: "음성/영상", video: "영상" },
  en: { audio: "Audio", conversation: "AI interview", mixed: "Audio/video", video: "Video" },
  ja: { audio: "音声", conversation: "AIインタビュー", mixed: "音声/映像", video: "映像" },
  zh: { audio: "音频", conversation: "AI访谈", mixed: "音频/视频", video: "视频" },
} satisfies Record<Locale, Record<"audio" | "conversation" | "mixed" | "video", string>>;

const topicLabel = {
  family: { ko: "오늘 남기고 싶은 주제", en: "Topic to leave today", ja: "今日残したいテーマ", zh: "今天想留下的主题" },
  future: { ko: "현재 목표 또는 고민", en: "Current goal or concern", ja: "今の目標や悩み", zh: "现在的目标或困惑" },
  kpop: { ko: "곡명 또는 녹음할 노래", en: "Song or track", ja: "曲名または録音する曲", zh: "歌曲或录音曲目" },
  performance: { ko: "공연명, 곡명, 무대 목적", en: "Performance title, song, or purpose", ja: "公演名、曲名、舞台の目的", zh: "演出名、曲名或舞台目的" },
  life: { ko: "오늘 남기고 싶은 인생 주제", en: "Life theme for today", ja: "今日残したい人生テーマ", zh: "今天想留下的人生主题" },
  visitor: { ko: "한국에서 남기고 싶은 순간", en: "Korea moment to save", ja: "韓国で残したい瞬間", zh: "想保存的韩国瞬间" },
} satisfies Record<ReturnType<typeof getStudioKind>, Record<Locale, string>>;

const topicPlaceholder = {
  family: { ko: "예: 엄마에게 하지 못한 말", en: "Example: words I never said to Mom", ja: "例：母に言えなかった言葉", zh: "例如：没对妈妈说出口的话" },
  future: { ko: "예: 10년 뒤에도 지키고 싶은 목표", en: "Example: a goal I want to keep in 10 years", ja: "例：10年後も守りたい目標", zh: "例如：十年后也想守住的目标" },
  kpop: { ko: "예: 내 인생 / 좋아하는 K-POP 곡", en: "Example: my life song / favorite K-POP track", ja: "例：人生の一曲 / 好きなK-POP", zh: "例如：我的人生歌曲 / 喜欢的K-POP" },
  performance: { ko: "예: 첫 라이브 공연, 졸업 무대", en: "Example: first live show, graduation stage", ja: "例：初ライブ、卒業公演", zh: "例如：第一次现场演出、毕业舞台" },
  life: { ko: "예: 음악 인생, 발레 첫 무대, 창업의 시작", en: "Example: music life, first ballet stage, why I started up", ja: "例：音楽人生、初舞台、創業の始まり", zh: "例如：音乐人生、第一次芭蕾舞台、创业开始" },
  visitor: { ko: "예: 서울의 마지막 밤", en: "Example: my last night in Seoul", ja: "例：ソウル最後の夜", zh: "例如：在首尔的最后一晚" },
} satisfies Record<ReturnType<typeof getStudioKind>, Record<Locale, string>>;

const productionIntro = {
  family: {
    ko: "음성 또는 영상으로 먼저 마음을 남기고, 이후 AI가 감정 흐름에 맞춰 질문합니다.",
    en: "Leave a voice or video message first. The AI guide will then follow the emotional thread.",
    ja: "まず音声や映像で想いを残し、その後AIが感情の流れに沿って質問します。",
    zh: "先用语音或视频留下心意，之后AI会顺着情感线继续提问。",
  },
  future: {
    ko: "녹음 없이 바로 AI 대화로 시작할 수 있습니다. 현재의 목표와 고민을 미래 편지로 정리합니다.",
    en: "You can begin with the AI interview right away. Today's goals and concerns become a future letter.",
    ja: "録音なしでAIインタビューを始められます。今の目標や悩みを未来への手紙にします。",
    zh: "可以直接开始AI访谈。现在的目标和困惑会整理成未来信。",
  },
  kpop: {
    ko: "곡 또는 MR을 선택하고 녹음한 뒤, 노래와 연결된 기억을 인터뷰합니다.",
    en: "Choose a song or MR, record your voice, then talk about the memory behind the song.",
    ja: "曲やMRを選んで録音し、その曲につながる記憶をインタビューします。",
    zh: "选择歌曲或MR并录音后，访谈这首歌背后的记忆。",
  },
  performance: {
    ko: "카메라와 마이크로 공연을 녹화한 뒤, 무대 의도와 관객 메시지를 인터뷰합니다.",
    en: "Record the performance with camera and microphone, then interview the stage intention and audience message.",
    ja: "カメラとマイクで公演を録画し、舞台意図や観客へのメッセージを聞きます。",
    zh: "用摄像头和麦克风记录演出后，访谈舞台意图和想留给观众的话。",
  },
  life: {
    ko: "입력한 직업/전공/삶의 배경에 맞춰 질문이 달라지는 맞춤 인터뷰입니다.",
    en: "A tailored interview that changes based on profession, major, and life background.",
    ja: "職業、専攻、人生背景に合わせて質問が変わるカスタムインタビューです。",
    zh: "根据职业、专业和人生背景生成不同问题的定制访谈。",
  },
  visitor: {
    ko: "여행 장면, K-콘텐츠 체험, 서울의 밤을 영상/음성/카드로 남깁니다.",
    en: "Turn a Korea trip, K-content moment, or Seoul night into video, voice, and cards.",
    ja: "旅行の場面、Kコンテンツ体験、ソウルの夜を映像・音声・カードに残します。",
    zh: "把韩国旅行、K内容体验或首尔夜晚保存成视频、语音和卡片。",
  },
} satisfies Record<ReturnType<typeof getStudioKind>, Record<Locale, string>>;

const studioCopy = {
  ko: {
    age: "나이",
    aiConversation: "AI 대화 인터뷰",
    aiInterviewBody: "녹음/녹화가 끝나면 AI가 상품 목적에 맞춰 대화를 이어갑니다.",
    aiInterviewReady: "AI 인터뷰 준비",
    answerPlaceholder: "말하듯이 편하게 적어주세요.",
    audioBody: "마이크 권한을 허용하면 브라우저에서 바로 녹음됩니다.",
    audioError: "오디오 녹음을 시작하지 못했습니다.",
    audioPreparing: "오디오 파일을 정리하고 있습니다.",
    audioPlaybackError: "녹음 파일을 재생하지 못했습니다. 브라우저의 소리 설정을 확인해주세요.",
    audioReady: "오디오 기록이 준비되었습니다.",
    audioRecordingStarted: "음성 녹음 중입니다. 말을 마치면 녹음 중지를 눌러주세요.",
    audioRecord: "마이크 녹음",
    back: "메인으로 돌아가기",
    brandLine: "AI 기반 기록 스튜디오",
    dialogueBody: "AI는 답변의 핵심 단어와 감정을 따라 다음 질문을 만듭니다.",
    downloadAudio: "오디오 다운로드",
    downloadVideo: "영상 다운로드",
    finishInterview: "인터뷰 마무리",
    mode: "진행 방식",
    cameraPrompt: "카메라와 마이크 권한 창이 뜨면 허용을 눌러주세요.",
    listenAudio: "녹음 들어보기",
    listenQuestion: "질문 음성 듣기",
    microphonePrompt: "마이크 권한 창이 뜨면 허용을 눌러주세요.",
    mood: "원하는 분위기",
    moodPlaceholder: "예: 담담하게, 따뜻하게, 무대처럼",
    name: "이름",
    namePlaceholder: "예: 송민준",
    occupation: "직업/전공/관심사",
    occupationPlaceholder: "예: 음악 전공, 발레, 창업자",
    output: "원하는 결과물",
    outputPlaceholder: "예: 편지, 영상, 음성, 카드",
    prepareStudio: "스튜디오 입장",
    permissionGuide: "녹음과 녹화는 이 브라우저 안에서만 진행됩니다. 버튼을 누르면 카메라/마이크 권한 요청이 나타납니다.",
    questionSpeaking: "질문 읽는 중...",
    recordAgain: "다시 녹음하기",
    recordingIdle: "버튼을 누르면 마이크 권한 요청 후 녹음이 시작됩니다.",
    recordingNow: "녹음 중입니다. 말을 마치면 녹음 중지를 눌러주세요.",
    recordingReady: "녹음이 완료되었습니다. 아래에서 바로 들어볼 수 있습니다.",
    recordedMedia: "녹음/녹화 기록",
    refine: "인터뷰 더 다듬기",
    relationship: "관계",
    relationshipPlaceholder: "예: 어머니, 미래의 나, 관객",
    routeLabel: "Studio",
    save: "저장",
    saved: "이 브라우저에 스튜디오 기록을 저장했습니다.",
    sendAnswer: "답변 저장",
    share: "공유",
    shareFallback: "이 브라우저에서는 공유를 사용할 수 없습니다.",
    setupBody: "방문 전 또는 입장 직후에 필요한 정보를 먼저 남깁니다. 이후 화면은 상품별로 다르게 진행됩니다.",
    songSelect: "곡 / MR 선택",
    songSelectBody: "녹음할 곡명이나 MR 파일을 준비합니다.",
    startAudio: "음성 녹음 시작",
    startInterview: "AI 인터뷰 시작",
    startVideo: "녹화 시작",
    stepFour: "04 결과물 미리보기",
    stepOne: "01 사전 정보",
    stepThree: "03 AI 인터뷰",
    stepTwo: "02 스튜디오 진행",
    stopAudio: "녹음 중지",
    stopVideo: "녹화 중지",
    target: "기록 대상",
    targetPlaceholder: "예: 엄마, 미래의 나, 관객",
    uploadMr: "MR 또는 음원 업로드",
    videoBody: "카메라와 마이크 권한을 허용하면 브라우저에서 녹화됩니다.",
    videoError: "영상 녹화를 시작하지 못했습니다.",
    videoPreparing: "영상 파일을 정리하고 있습니다.",
    videoReady: "영상 기록이 준비되었습니다.",
    videoRecord: "카메라 녹화",
    videoRecordingIdle: "버튼을 누르면 카메라와 마이크 권한 요청 후 녹화가 시작됩니다.",
    videoRecordingNow: "영상 기록 중입니다. 마치면 녹화 중지를 눌러주세요.",
    videoRecordingReady: "영상 기록이 완료되었습니다. 아래에서 바로 확인할 수 있습니다.",
    videoRecordingStarted: "영상 기록 중입니다. 마치면 녹화 중지를 눌러주세요.",
    visibility: "공개 여부",
    visibilityPlaceholder: "예: 비공개, 10년 뒤 공개, 가족 공유",
  },
  en: {
    age: "Age",
    aiConversation: "AI interview",
    aiInterviewBody: "After recording, the AI guide continues the conversation for this product.",
    aiInterviewReady: "AI interview ready",
    answerPlaceholder: "Write as if you were speaking.",
    audioBody: "Allow microphone access to record directly in the browser.",
    audioError: "Could not start audio recording.",
    audioPreparing: "Preparing audio file.",
    audioPlaybackError: "Could not play the recording. Please check your browser audio settings.",
    audioReady: "Audio record is ready.",
    audioRecordingStarted: "Voice recording is running. Press stop when you are finished.",
    audioRecord: "Microphone recording",
    back: "Back to main",
    brandLine: "AI-powered recording studio",
    dialogueBody: "The AI creates the next question from the key words and emotion in your answer.",
    downloadAudio: "Download audio",
    downloadVideo: "Download video",
    finishInterview: "Finish interview",
    mode: "Mode",
    cameraPrompt: "When the camera and microphone permission prompt appears, choose Allow.",
    listenAudio: "Listen to recording",
    listenQuestion: "Listen to question",
    microphonePrompt: "When the microphone permission prompt appears, choose Allow.",
    mood: "Desired mood",
    moodPlaceholder: "Example: calm, warm, cinematic",
    name: "Name",
    namePlaceholder: "Example: Alex",
    occupation: "Work / major / interest",
    occupationPlaceholder: "Example: music, ballet, founder",
    output: "Desired output",
    outputPlaceholder: "Example: letter, video, audio, card",
    prepareStudio: "Enter studio",
    permissionGuide: "Recording happens only in this browser. Press a button and allow camera or microphone access.",
    questionSpeaking: "Reading question...",
    recordAgain: "Record again",
    recordingIdle: "Press the button to allow microphone access and start recording.",
    recordingNow: "Recording now. Press stop when you are finished.",
    recordingReady: "Recording complete. You can listen below.",
    recordedMedia: "Recorded media",
    refine: "Refine interview",
    relationship: "Relationship",
    relationshipPlaceholder: "Example: mother, future self, audience",
    routeLabel: "Studio",
    save: "Save",
    saved: "Studio record saved in this browser.",
    sendAnswer: "Save answer",
    share: "Share",
    shareFallback: "Sharing is not available in this browser.",
    setupBody: "Add the details needed before or right after entering the studio. The next screen changes by product.",
    songSelect: "Song / MR selection",
    songSelectBody: "Prepare a song title or upload an MR file.",
    startAudio: "Start voice recording",
    startInterview: "Start AI interview",
    startVideo: "Start video",
    stepFour: "04 Result preview",
    stepOne: "01 Intake",
    stepThree: "03 AI interview",
    stepTwo: "02 Studio session",
    stopAudio: "Stop recording",
    stopVideo: "Stop video",
    target: "Record subject",
    targetPlaceholder: "Example: Mom, future me, audience",
    uploadMr: "Upload MR or audio",
    videoBody: "Allow camera and microphone access to record in the browser.",
    videoError: "Could not start video recording.",
    videoPreparing: "Preparing video file.",
    videoReady: "Video record is ready.",
    videoRecord: "Camera recording",
    videoRecordingIdle: "Press the button to allow camera and microphone access and start recording.",
    videoRecordingNow: "Video recording is running. Press stop when you are finished.",
    videoRecordingReady: "Video recording complete. You can watch it below.",
    videoRecordingStarted: "Video recording is running. Press stop when you are finished.",
    visibility: "Visibility",
    visibilityPlaceholder: "Example: private, open in 10 years, share with family",
  },
  ja: {
    age: "年齢",
    aiConversation: "AIインタビュー",
    aiInterviewBody: "録音・録画の後、この商品に合わせてAIが会話を進めます。",
    aiInterviewReady: "AIインタビュー準備",
    answerPlaceholder: "話すように、気楽に書いてください。",
    audioBody: "マイクの許可をすると、ブラウザで直接録音できます。",
    audioError: "音声録音を開始できませんでした。",
    audioPreparing: "音声ファイルを準備しています。",
    audioPlaybackError: "録音を再生できませんでした。ブラウザの音声設定を確認してください。",
    audioReady: "音声記録の準備ができました。",
    audioRecordingStarted: "録音中です。話し終えたら停止してください。",
    audioRecord: "マイク録音",
    back: "メインへ戻る",
    brandLine: "AI記録スタジオ",
    dialogueBody: "AIは回答のキーワードと感情から次の質問を作ります。",
    downloadAudio: "音声をダウンロード",
    downloadVideo: "映像をダウンロード",
    finishInterview: "インタビューを終了",
    mode: "進行方式",
    cameraPrompt: "カメラとマイクの許可画面が出たら、許可を押してください。",
    listenAudio: "録音を聞く",
    listenQuestion: "質問を聞く",
    microphonePrompt: "マイクの許可画面が出たら、許可を押してください。",
    mood: "希望する雰囲気",
    moodPlaceholder: "例：落ち着いて、あたたかく、映画のように",
    name: "名前",
    namePlaceholder: "例：Minjun",
    occupation: "職業・専攻・関心",
    occupationPlaceholder: "例：音楽専攻、バレエ、創業者",
    output: "希望する成果物",
    outputPlaceholder: "例：手紙、映像、音声、カード",
    prepareStudio: "スタジオに入る",
    permissionGuide: "録音と録画はこのブラウザ内で行われます。ボタンを押すと権限確認が表示されます。",
    questionSpeaking: "質問を読み上げています...",
    recordAgain: "もう一度録音する",
    recordingIdle: "ボタンを押すと、マイク許可の後に録音が始まります。",
    recordingNow: "録音中です。話し終えたら停止してください。",
    recordingReady: "録音が完了しました。下で確認できます。",
    recordedMedia: "録音・録画記録",
    refine: "インタビューを整える",
    relationship: "関係",
    relationshipPlaceholder: "例：母、未来の自分、観客",
    routeLabel: "Studio",
    save: "保存",
    saved: "このブラウザにスタジオ記録を保存しました。",
    sendAnswer: "回答を保存",
    share: "共有",
    shareFallback: "このブラウザでは共有を使用できません。",
    setupBody: "来訪前または入室直後に必要な情報を残します。次の画面は商品ごとに変わります。",
    songSelect: "曲 / MR選択",
    songSelectBody: "録音する曲名、またはMRファイルを準備します。",
    startAudio: "録音開始",
    startInterview: "AIインタビュー開始",
    startVideo: "録画開始",
    stepFour: "04 成果物プレビュー",
    stepOne: "01 事前情報",
    stepThree: "03 AIインタビュー",
    stepTwo: "02 スタジオ進行",
    stopAudio: "録音停止",
    stopVideo: "録画停止",
    target: "記録対象",
    targetPlaceholder: "例：母、未来の自分、観客",
    uploadMr: "MRまたは音源をアップロード",
    videoBody: "カメラとマイクの許可をすると、ブラウザで録画できます。",
    videoError: "映像録画を開始できませんでした。",
    videoPreparing: "映像ファイルを準備しています。",
    videoReady: "映像記録の準備ができました。",
    videoRecord: "カメラ録画",
    videoRecordingIdle: "ボタンを押すと、カメラとマイクの許可後に録画が始まります。",
    videoRecordingNow: "録画中です。終わったら停止してください。",
    videoRecordingReady: "録画が完了しました。下で確認できます。",
    videoRecordingStarted: "録画中です。終わったら停止してください。",
    visibility: "公開設定",
    visibilityPlaceholder: "例：非公開、10年後に公開、家族に共有",
  },
  zh: {
    age: "年龄",
    aiConversation: "AI访谈",
    aiInterviewBody: "录音或录像结束后，AI会根据该产品继续对话。",
    aiInterviewReady: "AI访谈准备",
    answerPlaceholder: "像说话一样轻松写下来。",
    audioBody: "允许麦克风权限后，可直接在浏览器中录音。",
    audioError: "无法开始音频录制。",
    audioPreparing: "正在整理音频文件。",
    audioPlaybackError: "无法播放录音。请检查浏览器声音设置。",
    audioReady: "音频记录已准备好。",
    audioRecordingStarted: "正在录音。说完后请点击停止。",
    audioRecord: "麦克风录音",
    back: "返回首页",
    brandLine: "AI记录工作室",
    dialogueBody: "AI会根据回答中的关键词和情绪生成下一道问题。",
    downloadAudio: "下载音频",
    downloadVideo: "下载视频",
    finishInterview: "结束访谈",
    mode: "进行方式",
    cameraPrompt: "出现摄像头和麦克风权限提示时，请点击允许。",
    listenAudio: "试听录音",
    listenQuestion: "播放问题语音",
    microphonePrompt: "出现麦克风权限提示时，请点击允许。",
    mood: "想要的氛围",
    moodPlaceholder: "例如：平静、温暖、像电影一样",
    name: "姓名",
    namePlaceholder: "例如：Minjun",
    occupation: "职业/专业/兴趣",
    occupationPlaceholder: "例如：音乐专业、芭蕾、创业者",
    output: "想要的结果",
    outputPlaceholder: "例如：信件、视频、音频、卡片",
    prepareStudio: "进入工作室",
    permissionGuide: "录音和录像只在此浏览器中进行。点击按钮后会出现权限请求。",
    questionSpeaking: "正在朗读问题...",
    recordAgain: "重新录音",
    recordingIdle: "点击按钮后，将请求麦克风权限并开始录音。",
    recordingNow: "正在录音。说完后请点击停止。",
    recordingReady: "录音完成。可在下方试听。",
    recordedMedia: "录音/录像记录",
    refine: "继续整理访谈",
    relationship: "关系",
    relationshipPlaceholder: "例如：妈妈、未来的我、观众",
    routeLabel: "Studio",
    save: "保存",
    saved: "已将工作室记录保存在此浏览器。",
    sendAnswer: "保存回答",
    share: "分享",
    shareFallback: "此浏览器不支持分享。",
    setupBody: "在到访前或进入工作室后，先留下必要信息。下一步会根据产品显示不同体验。",
    songSelect: "歌曲 / MR选择",
    songSelectBody: "准备要录制的歌曲名或MR文件。",
    startAudio: "开始录音",
    startInterview: "开始AI访谈",
    startVideo: "开始录像",
    stepFour: "04 结果预览",
    stepOne: "01 预先信息",
    stepThree: "03 AI访谈",
    stepTwo: "02 工作室进行",
    stopAudio: "停止录音",
    stopVideo: "停止录像",
    target: "记录对象",
    targetPlaceholder: "例如：妈妈、未来的我、观众",
    uploadMr: "上传MR或音源",
    videoBody: "允许摄像头和麦克风权限后，可直接在浏览器中录像。",
    videoError: "无法开始视频录制。",
    videoPreparing: "正在整理视频文件。",
    videoReady: "视频记录已准备好。",
    videoRecord: "摄像头录像",
    videoRecordingIdle: "点击按钮后，将请求摄像头和麦克风权限并开始录像。",
    videoRecordingNow: "正在录像。结束后请点击停止。",
    videoRecordingReady: "录像完成。可在下方查看。",
    videoRecordingStarted: "正在录像。结束后请点击停止。",
    visibility: "公开设置",
    visibilityPlaceholder: "例如：不公开、10年后公开、与家人分享",
  },
} satisfies Record<Locale, Record<string, string>>;
