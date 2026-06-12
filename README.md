# Memory Room

Memory Room은 음성, 영상, 질문 답변, 편지 형태로 인생의 기억을 남기고 나중에 다시 열어볼 수 있게 하는 프라이빗 기록 MVP입니다.

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 아래 주소로 접속합니다.

```text
http://localhost:3000
```

QA 체크리스트는 아래 주소에서 확인합니다.

```text
http://localhost:3000/qa
```

## 핵심 흐름

1. 메인 화면에서 기록을 시작합니다.
2. 질문에 답하거나 음성 입력으로 답변을 작성합니다.
3. 결과물이 생성되면 이메일을 입력합니다.
4. `결과물 저장하기`를 누르면 Supabase `memories` 테이블에 저장됩니다.
5. `/memory/[token]` 링크로 결과물을 다시 확인합니다.

## 저장 방식

- 결과물은 Supabase `memories` 테이블에만 영구 저장합니다.
- 개발 서버 메모리 기반 mock 저장소는 사용하지 않습니다.
- Supabase 환경값이 없으면 결과물 저장은 실패합니다.
- kioskMode에서는 사용자 입력, 결과물, 음성 데이터가 localStorage에 저장되지 않습니다.
- `/memory/[token]` 링크는 Supabase에 저장된 `access_token`으로만 조회됩니다.

## 필요한 환경값

`.env.local` 파일에 아래 값을 넣습니다. 실제 값은 GitHub에 올리지 마세요.

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-api-key
```

서버에서 RLS가 켜진 테이블에 저장/조회하므로 `SUPABASE_SERVICE_ROLE_KEY` 설정을 권장합니다.

## Supabase 테이블 SQL

`supabase/memories.sql` 파일을 Supabase SQL Editor에서 실행합니다.

저장 필드:

- `id`
- `title`
- `recipient`
- `message_text`
- `selected_questions`
- `answers`
- `audio_url`
- `created_at`
- `email`
- `access_token`

## QA 체크리스트

- [ ] 첫 접속 시 이전 사용자 데이터가 보이지 않는다
- [ ] 기록 시작 버튼 클릭 가능
- [ ] 질문 답변 입력 가능
- [ ] 음성 입력 시작 시 마이크 권한 요청
- [ ] 녹음 중지 후 OpenAI STT 결과가 textarea에 자동 입력됨
- [ ] STT 결과를 사용자가 수정 가능
- [ ] 기록 완료 후 이메일 입력 화면이 표시됨
- [ ] 잘못된 이메일 형식은 저장 불가
- [ ] 결과물 저장 후 고유 링크가 표시됨
- [ ] 서버 재시작 후에도 `/memory/[token]` 접속 시 결과물 확인 가능
- [ ] 잘못된 token 접속 시 오류 메시지 표시
- [ ] 메인으로 돌아가기 클릭 시 초기화
- [ ] 5분 무입력 시 자동 초기화
- [ ] 모바일 Chrome/Safari에서 녹음 기반 STT 기본 흐름 확인

## 아직 실제 운영 전 필요한 것

- 이메일 발송 및 본인 인증
- 음성/영상 파일의 Supabase Storage 업로드
- accessToken 만료/회수 정책
- 매장 기기별 운영 로그
- 운영자용 결과물 관리 화면
