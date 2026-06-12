"use client";

import { ExternalLink, RotateCcw } from "lucide-react";
import type { LetterRevisionAction } from "../lib/storage";

type Props = {
  finalLetter: string;
  resultUrl: string;
  revisionCount: number;
  recordedVideoUrl: string;
  videoFileName: string;
  onReset: () => void;
  onRevise: (action: LetterRevisionAction) => void;
};

const revisionActions: LetterRevisionAction[] = [
  "더 부드럽게",
  "더 담담하게",
  "더 감성적으로",
  "짧게 줄이기",
  "가족에게 말하듯 수정",
];

export function FinalLetter({
  finalLetter,
  resultUrl,
  revisionCount,
  recordedVideoUrl,
  videoFileName,
  onReset,
  onRevise,
}: Props) {
  return (
    <section className="letter-screen">
      <div>
        <p className="eyebrow">가족에게 남기는 이야기</p>
        <h1>가족에게 남기는 편지</h1>
        <p className="letter-note">
          남겨주신 장면과 말을 바탕으로 가족에게 직접 전하는 문장으로 옮겼습니다.
          결과 페이지에서 링크를 복사하거나 PDF로 저장할 수 있습니다.
        </p>
      </div>

      <article className="letter-paper">
        {finalLetter.split("\n").map((line, index) =>
          line ? <p key={index}>{line}</p> : <br key={index} />,
        )}
      </article>

      <div className="button-row">
        {resultUrl && (
          <a className="primary-button compact download-link" href={resultUrl} target="_blank" rel="noreferrer">
            <ExternalLink size={17} aria-hidden="true" />
            결과 페이지 열기
          </a>
        )}
      </div>

      {recordedVideoUrl && (
        <section className="video-recorder-panel">
          <div className="video-recorder-header">
            <div>
              <p className="eyebrow">함께 남긴 영상</p>
              <p>인터뷰 중 기록한 영상을 다시 볼 수 있습니다.</p>
            </div>
            <a className="secondary-button download-link" href={recordedVideoUrl} download={videoFileName}>
              영상 다운로드
            </a>
          </div>
          <video className="video-playback" src={recordedVideoUrl} controls playsInline />
        </section>
      )}

      <div className="revision-panel">
        <p className="eyebrow">편지 다듬기 {revisionCount > 0 ? `${revisionCount}회 수정` : ""}</p>
        <div className="button-row">
          {revisionActions.map((action) => (
            <button
              className="secondary-button"
              type="button"
              key={action}
              onClick={() => onRevise(action)}
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      <div className="button-row">
        <button className="secondary-button" type="button" onClick={onReset}>
          <RotateCcw size={17} aria-hidden="true" />
          새 기록 시작
        </button>
      </div>
    </section>
  );
}
