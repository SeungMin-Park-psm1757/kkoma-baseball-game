# Google Flow 오디오 제작 프롬프트

## 1. 경기 배경음악

권장 파일명: `baseball-bgm-loop.mp3`  
권장 길이: 60초  
게임 적용: 경기 시작부터 결과 화면 직전까지 반복 재생, 효과음보다 약 10~12dB 작게 믹스

```text
Create a seamless 60-second instrumental background music loop for a cheerful Korean children's baseball web game for ages 7–9. 128 BPM, bright major key, playful and energetic but never frantic. Use light marching snare, hand claps, pizzicato strings, marimba, cheerful brass stabs, soft electric bass, and a small amount of arcade-style synth sparkle. The melody should feel like a sunny neighborhood baseball game and encourage the player to try again. Keep the arrangement spacious so bat, glove, throw, safe, out, and home-run sound effects remain clear. No vocals, no chanting, no spoken words, no crowd roar, no copyrighted melody, no dramatic cinematic tension. Start and end on matching harmony and rhythm for a perfectly seamless loop. Clean game-audio mix, warm, cute, optimistic.
```

레벨별 편집 지시:

- 1·2탄: 원본 그대로 사용. 가볍고 친근한 느낌.
- 3·4탄: 같은 멜로디에 나무 타악기와 장난스러운 피치카토를 조금 추가.
- 5·6탄: 같은 멜로디를 유지하고 템포감 있는 스네어와 귀여운 저음 브라스를 약하게 추가. 공포 분위기는 금지.

## 2. 효과음 제작 목록

각 효과음은 음악 없이 단독 파일로 생성합니다. 시작과 끝에 긴 무음이 없어야 하며, 초등학생에게 불쾌하거나 위협적인 소리는 피합니다.

### 타격 — 0.45초

권장 파일명: `sfx-bat-hit.wav`

```text
Create a 0.45-second clean cartoon baseball bat hit sound for a children's web game: one crisp wooden crack, a tiny bright impact sparkle, and a very short airy tail. Satisfying and energetic, not explosive, not metallic, no voice, no crowd, no music, no silence before the hit.
```

재생 시점: 배트와 공이 맞는 바로 그 프레임.

### 글러브 포구 — 0.35초

권장 파일명: `sfx-glove-catch.wav`

```text
Create a 0.35-second close baseball glove catch sound for a cute children's game: one soft leather pop with a compact low thump. Clear and readable, not painful, no voice, no crowd, no music, no reverb tail.
```

재생 시점: 내야수·외야수가 타구를 잡는 순간과 베이스 수비수가 송구를 받는 순간.

### 송구 — 0.45초

권장 파일명: `sfx-throw-whoosh.wav`

```text
Create a 0.45-second playful baseball throw sound: a quick hand release followed by a light rising air whoosh and a tiny ball-spin flutter. Cute arcade realism, not a laser, no impact, no voice, no music.
```

재생 시점: 외야수→1루, 1루→2루, 2루→3루 송구가 출발하는 순간마다 1회.

### 세이프 — 0.8초

권장 파일명: `sfx-safe.wav`

```text
Create a 0.8-second cheerful SAFE confirmation sound for a Korean children's baseball game: a soft base-touch thump followed by two rising marimba notes and a small bright chime. Friendly success, no spoken word, no crowd, no music bed.
```

재생 시점: 주자가 공보다 먼저 각 베이스에 도착한 순간.

### 아웃 — 0.8초

권장 파일명: `sfx-out.wav`

```text
Create a 0.8-second gentle OUT result sound for a children's baseball game: glove pop, short wooden block knock, then one soft descending note. Clear feedback without fear or punishment. No voice, no buzzer, no crowd booing, no music.
```

재생 시점: 수비수가 주자보다 먼저 베이스에서 공을 받은 순간.

### 스트라이크 — 0.55초

권장 파일명: `sfx-strike.wav`

```text
Create a 0.55-second light cartoon baseball strike sound: quick mitt pop and one short neutral whistle tick. Informative, playful, not harsh, no spoken umpire call, no crowd, no music.
```

재생 시점: 헛스윙 또는 타이밍 실패 1·2회째.

### 삼진 아웃 — 1.2초

권장 파일명: `sfx-strikeout.wav`

```text
Create a 1.2-second child-friendly baseball strikeout cue: mitt pop, three quick wooden clicks, and a short soft descending brass phrase that ends encouragingly. No spoken words, no booing, no scary sound, no music bed.
```

재생 시점: 스트라이크 카운트가 3이 되는 순간.

### 파울 — 0.65초

권장 파일명: `sfx-foul.wav`

```text
Create a 0.65-second cartoon baseball foul-ball cue: light bat tick, fast sideways air zip, and a small neutral woodblock ending. No voice, no whistle blast, no crowd, no music.
```

재생 시점: 공이 파울 궤적으로 전환되는 순간.

### 주자 출발·진루 — 0.7초

권장 파일명: `sfx-runner-advance.wav`

```text
Create a 0.7-second cute runner-advance sound for a children's baseball game: three light dirt footsteps, a tiny uniform rustle, and a subtle rising percussion accent. No voice, no music, no heavy stomps.
```

재생 시점: 타자주자가 홈에서 출발할 때. 여러 주자가 동시에 움직여도 1회만 재생.

### 홈런 팡파레 — 2.8초

권장 파일명: `sfx-home-run-fanfare.wav`

```text
Create a 2.8-second joyful home-run fanfare for a Korean children's baseball game: powerful wooden bat crack, four-note bright brass victory flourish, hand claps, paper confetti flutter, and a sparkling chime finish. Big and exciting but cute, clean and not deafening. No spoken words, no stadium announcer, no copyrighted melody, no long crowd ambience, no music bed.
```

재생 시점: 공이 외야 담장선을 완전히 넘어가는 순간. 화면의 색종이 연출과 동시에 시작.

### UI 선택 — 0.15초

권장 파일명: `sfx-ui-click.wav`

```text
Create a 0.15-second soft playful UI selection click for a children's game: one warm wooden tick with a tiny bubble-like sparkle. No voice, no music, no reverb.
```

재생 시점: 캐릭터 선택, 레벨 선택, 계속하기 버튼.

## 3. 납품 형식

- 효과음: WAV, 48kHz, 24-bit 권장
- 배경음악: WAV 원본과 MP3 또는 OGG 웹용 파일을 함께 보관
- 피크: 배경음악 -6dB 이하, 효과음 -3dB 이하
- 모든 파일은 앞뒤 무음을 최소화하고, 홈런 팡파레를 제외하면 1.2초 이내로 유지
