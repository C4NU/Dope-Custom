# Technical Overview

## 기술 스택
- Ghost Theme Engine
- Gulp (Asset Pipeline)
- PostCSS
- jQuery (Optional)

## 주요 기능 설명
### 폰트 시스템
- Barlow: 영문 및 숫자 가독성을 위한 메인 폰트
- LINE Seed: 국문 및 일문 지원을 위한 현대적인 서체
- Windows 렌더링 최적화: `antialiased` 및 `optimizeLegibility` 적용

### 다국어 지원
- `locales/` 디렉토리의 JSON 파일을 통해 테마 내 문자열 관리
- `{{t}}` 헬퍼 및 JS `window.theme_config`를 통한 통합 관리
