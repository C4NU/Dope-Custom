# Dope

간행물을 컬렉션으로 정리할 수 있는 독특한 태그 기반 [Ghost](https.github.com/TryGhost/Ghost) 테마입니다. 아름답게 디자인된 태그 열을 통해 독자들이 간행물을 체계적으로 탐색할 수 있도록 하세요.

**데모: https://dope.ghost.io**

# 설치 방법

1. [이 테마 다운로드](https://github.com/TryGhost/Dope/archive/main.zip)
2. Ghost에 로그인한 후, `Design` 설정 영역으로 이동하여 zip 파일을 업로드하세요.

# 개발

스타일은 Gulp/PostCSS를 사용하여 컴파일되며, 최신 CSS 사양을 위한 폴리필(polyfill)이 적용됩니다. 전역적으로 [Node](https://nodejs.org/), [Yarn](https://yarnpkg.com/), [Gulp](https://gulpjs.com)가 설치되어 있어야 합니다. 그 다음, 테마의 루트 디렉터리에서 다음을 실행하세요:

```bash
# 의존성 설치
yarn

# 변경사항 감지 및 빌드 실행
yarn dev
```

이제 `/assets/css/` 파일을 수정하면 `/assets/built/` 디렉터리로 자동으로 컴파일됩니다.

`zip` Gulp 작업은 테마 파일들을 `dist/<name>_v<version>_<YYYYMMDD-HHMMSS>.zip` 형식으로 패키징하며, 파일명이 중복되지 않도록 자동으로 버전과 타임스탬프를 포함합니다.

```bash
yarn zip
```


yarn# 기여

이 저장소는 [TryGhost/Themes](https.github.com/TryGhost/Themes) 모노레포와 자동으로 동기화됩니다. 기여하거나 이슈를 제기하고 싶다면, 공식 테마가 개발되는 메인 저장소인 [TryGhost/Themes](https://github.com/TryGhost/Themes)로 이동해주세요.

# 저작권 및 라이선스

Copyright (c) 2013-2023 Ghost Foundation - [MIT 라이선스](LICENSE)에 따라 배포됩니다.
