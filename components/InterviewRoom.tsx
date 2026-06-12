"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Download, Mic, Mic2, Video, Volume2, VolumeX } from "lucide-react";
import { startAudioRecorder, stopAudioStream, type AudioRecorderSession } from "../lib/audioRecorder";
import { transcribeAudioWithServer } from "../lib/serverStt";
import { startVideoRecorder, stopStream, type VideoRecorderSession } from "../lib/videoRecorder";
import type { Locale } from "../lib/types";
import { MemoryGuideAvatar } from "./MemoryGuideAvatar";

type Props = {
  question: string;
  questionNumber: number;
  totalQuestions: number;
  isSpeaking: boolean;
  locale: Locale;
  voiceEnabled: boolean;
  recordedVideoUrl: string;
  videoFileName: string;
  onBack: () => void;
  onReplay: () => void;
  onVideoRecorded: (blob: Blob) => void;
  onSaveAnswer: (answer: string) => void;
  onToggleVoice: () => void;
};

export function InterviewRoom({
  question,
  questionNumber,
  totalQuestions,
  isSpeaking,
  locale,
  voiceEnabled,
  recordedVideoUrl,
  videoFileName,
  onBack,
  onReplay,
  onVideoRecorded,
  onSaveAnswer,
  onToggleVoice,
}: Props) {
  const copy = interviewCopy[locale];
  const [answer, setAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognitionMessage, setRecognitionMessage] = useState("");
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [videoMessage, setVideoMessage] = useState("");
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const speechAudioRef = useRef<AudioRecorderSession | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const recorderRef = useRef<VideoRecorderSession | null>(null);
  const progress = Math.round(((questionNumber - 1) / totalQuestions) * 100);

  useEffect(() => {
    return () => {
      stopAudioStream(speechAudioRef.current?.stream ?? null);
      stopStream(previewStream);
    };
  }, [previewStream]);

  useEffect(() => {
    if (!videoPreviewRef.current) return;
    videoPreviewRef.current.srcObject = previewStream;
  }, [previewStream]);

  function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isListening) {
      setRecognitionMessage("음성 입력 중입니다. 중지를 눌러 텍스트 변환을 마친 뒤 저장해주세요.");
      return;
    }
    onSaveAnswer(answer);
    setAnswer("");
    setIsListening(false);
    setRecognitionMessage("");
  }

  async function toggleVideoRecording() {
    if (isRecordingVideo) {
      const recorder = recorderRef.current;
      if (!recorder) return;
      setIsRecordingVideo(false);
      setVideoMessage(copy.videoPreparing);
      const blob = await recorder.stop();
      recorderRef.current = null;
      setPreviewStream(null);
      onVideoRecorded(blob);
      setVideoMessage(copy.videoReady);
      return;
    }

    try {
      setVideoMessage("");
      const recorder = await startVideoRecorder();
      recorderRef.current = recorder;
      setPreviewStream(recorder.stream);
      setIsRecordingVideo(true);
    } catch (error) {
      setVideoMessage(error instanceof Error ? error.message : copy.videoStartError);
      setIsRecordingVideo(false);
    }
  }

  async function toggleSpeechRecognition() {
    if (isListening) {
      const recorder = speechAudioRef.current;
      if (!recorder) {
        setIsListening(false);
        return;
      }

      try {
        setIsListening(false);
        setRecognitionMessage("음성을 텍스트로 변환하고 있습니다...");
        const blob = await recorder.stop();
        speechAudioRef.current = null;
        const result = await transcribeAudioWithServer({ audio: blob, language: "ko" });
        setAnswer((current) => (current.trim() ? `${current.trimEnd()} ${result.text}` : result.text));
        setRecognitionMessage("음성 입력이 답변창에 입력되었습니다. 필요하면 직접 수정해주세요.");
      } catch (error) {
        setRecognitionMessage(error instanceof Error ? error.message : "음성을 텍스트로 변환하지 못했습니다.");
      }
      return;
    }

    try {
      setRecognitionMessage("마이크 권한을 요청합니다. 허용 후 답변을 말씀해주세요.");
      speechAudioRef.current = await startAudioRecorder();
      setIsListening(true);
      setRecognitionMessage("음성 입력 중입니다. 말을 마치면 음성 입력 중지를 눌러주세요.");
    } catch (error) {
      setRecognitionMessage(error instanceof Error ? error.message : copy.speechStartError);
      setIsListening(false);
    }
  }

  return (
    <section className="interview-screen">
      <div className="interview-top-grid">
        <MemoryGuideAvatar isSpeaking={isSpeaking} locale={locale} />
        <div className="welcome-box">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p>{copy.body}</p>
          <div className="progress-track" aria-label={`${copy.progress} ${progress}%`}>
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <form className="question-area" onSubmit={submitAnswer}>
        <div className="question-card">
          <p className="eyebrow">{copy.question} {questionNumber} / {totalQuestions}</p>
          <p className="question-text">{question}</p>
        </div>

        <div className="answer-input">
          <div className="input-header">
            <Mic2 size={18} aria-hidden="true" />
            <span>{copy.answerLabel}</span>
          </div>
          <textarea
            autoFocus
            required
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder={copy.placeholder}
          />
          <div className="speech-recognition-row">
            <button
              className={`secondary-button ${isListening ? "listening-button" : ""}`}
              type="button"
              onClick={toggleSpeechRecognition}
            >
              <Mic size={17} aria-hidden="true" />
              {isListening ? copy.listening : copy.speakWithMic}
            </button>
            {recognitionMessage && <p className="helper-message">{recognitionMessage}</p>}
          </div>
        </div>

        <section className="video-recorder-panel">
          <div className="video-recorder-header">
            <div>
              <p className="eyebrow">{copy.videoEyebrow}</p>
              <p>{copy.videoBody}</p>
            </div>
            <button
              className={`secondary-button ${isRecordingVideo ? "recording-button" : ""}`}
              type="button"
              onClick={toggleVideoRecording}
            >
              <Video size={17} aria-hidden="true" />
              {isRecordingVideo ? copy.stopVideo : copy.startVideo}
            </button>
          </div>

          {videoMessage && <p className="helper-message">{videoMessage}</p>}

          <div className="video-preview-grid">
            {previewStream && (
              <video className="video-preview" ref={videoPreviewRef} autoPlay muted playsInline />
            )}
            {recordedVideoUrl && (
              <div className="recorded-video-card">
                <video className="video-preview" src={recordedVideoUrl} controls playsInline />
                <a className="secondary-button download-link" href={recordedVideoUrl} download={videoFileName}>
                  <Download size={17} aria-hidden="true" />
                  {copy.downloadVideo}
                </a>
              </div>
            )}
          </div>
        </section>

        <div className="button-row">
          <button className="secondary-button" type="button" onClick={onBack}>
            <ArrowLeft size={17} aria-hidden="true" />
            {copy.back}
          </button>
          <button className="secondary-button" type="button" onClick={onReplay}>
            <Volume2 size={17} aria-hidden="true" />
            {copy.replay}
          </button>
          <button className="secondary-button" type="button" onClick={onToggleVoice}>
            {voiceEnabled ? <VolumeX size={17} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}
            {voiceEnabled ? copy.voiceOff : copy.voiceOn}
          </button>
          <button className="primary-button compact" type="submit">
            {copy.saveNext}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </form>
    </section>
  );
}

const interviewCopy = {
  ko: {
    answerLabel: "답변 입력",
    back: "정보 수정",
    body: "떠오르는 만큼만 적어도 괜찮습니다. 답변은 다음 질문과 마지막 편지에 반영됩니다.",
    downloadVideo: "영상 다운로드",
    eyebrow: "마음 기록",
    listening: "음성 입력 중지",
    placeholder: "떠오르는 만큼만 편하게 적어주세요.",
    progress: "진행률",
    question: "질문",
    replay: "다시 듣기",
    saveNext: "답변 저장하고 다음으로",
    speakWithMic: "음성 입력 시작",
    speechStartError: "음성인식을 시작하지 못했습니다. 마이크 권한을 확인한 뒤 다시 시도해 주세요.",
    startVideo: "영상 기록 시작",
    stopVideo: "영상 기록 중지",
    title: "한 번에 하나의 질문만 천천히 이어갑니다.",
    videoBody: "원하시면 얼굴과 목소리를 함께 남길 수 있습니다. 영상은 이 브라우저에서만 만들어집니다.",
    videoEyebrow: "영상 기록",
    videoPreparing: "영상 파일을 정리하고 있습니다.",
    videoReady: "영상 기록이 준비되었습니다.",
    videoStartError: "영상 기록을 시작하지 못했습니다.",
    voiceOff: "음성 끄기",
    voiceOn: "음성 켜기",
  },
  en: {
    answerLabel: "Your answer",
    back: "Edit details",
    body: "Write only what comes naturally. Your answer will shape the next question and the final record.",
    downloadVideo: "Download video",
    eyebrow: "Memory Record",
    listening: "Listening...",
    placeholder: "Write only as much as comes to mind.",
    progress: "Progress",
    question: "Question",
    replay: "Replay",
    saveNext: "Save answer and continue",
    speakWithMic: "Speak with microphone",
    speechStartError: "Speech recognition could not start. Please check microphone permission and try again.",
    startVideo: "Start video record",
    stopVideo: "Stop video record",
    title: "One gentle question at a time.",
    videoBody: "If you want, you can keep your face and voice together. The video is created only in this browser.",
    videoEyebrow: "Video record",
    videoPreparing: "Preparing the video file.",
    videoReady: "Your video record is ready.",
    videoStartError: "Could not start video recording.",
    voiceOff: "Turn voice off",
    voiceOn: "Turn voice on",
  },
  ja: {
    answerLabel: "回答入力",
    back: "情報を修正",
    body: "思い浮かぶ分だけで大丈夫です。回答は次の質問と最後の記録に反映されます。",
    downloadVideo: "映像をダウンロード",
    eyebrow: "記憶の記録",
    listening: "聞き取り中...",
    placeholder: "思い浮かぶ分だけ、気楽に書いてください。",
    progress: "進行",
    question: "質問",
    replay: "もう一度聞く",
    saveNext: "回答を保存して次へ",
    speakWithMic: "マイクで話す",
    speechStartError: "音声認識を開始できませんでした。マイクの許可を確認して、もう一度お試しください。",
    startVideo: "映像記録を開始",
    stopVideo: "映像記録を停止",
    title: "一度にひとつの質問だけ、ゆっくり進みます。",
    videoBody: "必要であれば、顔と声を一緒に残せます。映像はこのブラウザ内だけで作成されます。",
    videoEyebrow: "映像記録",
    videoPreparing: "映像ファイルを準備しています。",
    videoReady: "映像記録の準備ができました。",
    videoStartError: "映像記録を開始できませんでした。",
    voiceOff: "音声をオフ",
    voiceOn: "音声をオン",
  },
  zh: {
    answerLabel: "输入回答",
    back: "修改信息",
    body: "想到多少写多少就好。你的回答会影响下一道问题和最后生成的记录。",
    downloadVideo: "下载视频",
    eyebrow: "记忆记录",
    listening: "正在听...",
    placeholder: "想到多少，就轻松写多少。",
    progress: "进度",
    question: "问题",
    replay: "再听一次",
    saveNext: "保存回答并继续",
    speakWithMic: "用麦克风说话",
    speechStartError: "无法启动语音识别。请检查麦克风权限后再试。",
    startVideo: "开始视频记录",
    stopVideo: "停止视频记录",
    title: "一次只问一个问题，慢慢来。",
    videoBody: "如果愿意，也可以把脸和声音一起留下。视频只会在这个浏览器中生成。",
    videoEyebrow: "视频记录",
    videoPreparing: "正在整理视频文件。",
    videoReady: "视频记录已准备好。",
    videoStartError: "无法开始视频记录。",
    voiceOff: "关闭语音",
    voiceOn: "开启语音",
  },
} satisfies Record<Locale, Record<string, string>>;
