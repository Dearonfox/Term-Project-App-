# Term Project – Netflix Demo (Web + Mobile)

넷플릭스 UI를 참고한 **TMDB 기반 영화 탐색 데모 프로젝트**입니다.  
Web(React) 버전은 배포 완료 상태이며, Mobile(React Native/Expo) 버전은 Web 기능을 동일하게 앱으로 이식했습니다.

---

## Demo

- **Web 배포 주소:** http://113.198.66.75:18139/

---

## 주요 기능

### 공통(웹/앱)
- **Firebase Authentication**
  - 회원가입 / 로그인 / 비밀번호 재설정
- **TMDB 영화 데이터**
  - 홈 배너(인기 영화 랜덤)
  - 인기/최신/장르별 목록
  - 검색
  - 영화 상세 모달(줄거리/평점/장르/러닝타임/출연진 등)
- **찜(My List)**
  - Firestore에 사용자별 찜 목록 저장/조회/삭제

### Web 추가 기능
- 최근 검색어 저장(로컬 스토리지 기반)
- 검색 결과에서 ★로 찜 토글

---

## TMDB 호출 구조 (중요)

✅ **TMDB API Key를 프론트에 두지 않습니다.**  
TMDB 호출은 **클라우드 VM 프록시 서버**가 대신 처리합니다.

- 프록시 서버: `113.198.66.75:18139`
- 프론트는 항상 아래처럼 호출:
  - `GET /api/tmdb/...`

예)
- `/api/tmdb/movie/popular`
- `/api/tmdb/search/movie?query=...`
- `/api/tmdb/movie/{id}`
- `/api/tmdb/movie/{id}/credits`

---

## 기술 스택

- Web: React, TypeScript
- Mobile: React Native(Expo), TypeScript, React Navigation
- Backend Proxy: VM 서버 프록시(`/api/tmdb`)
- Auth/DB: Firebase Authentication, Firestore
- Data: TMDB API (proxy through VM)

---

## 프로젝트 구조 (예시)

### Web (`my-app/`)
- `src/pages` : Home / Popular / Search / Wishlist / Signin
- `src/Component` : Banner / MovieRow / MovieCard / MovieDetailModal / Layout
- `src/api/tmdb.ts` : axios 인스턴스 (프록시 경로 사용)
- `src/utils/wishlist.ts` : 찜(Firestore) + (Web의 경우) 로컬 유틸 일부

### Mobile (`netflix-mobile/`)
- `src/screens` : HomeScreen / PopularScreen / SearchScreen / WishlistScreen / SigninScreen
- `src/components` : Banner / MovieRow / MovieCard / MovieDetailModal
- `src/firebase.ts` : Firebase init (RN용)
- `src/utils/wishlist.ts` : Firestore 기반 찜 유틸

---

## 실행 방법

웹
cd my-app
npm install
npm start

모바일
npm install
npx expo start
xpo Go 앱 설치 후 QR 스캔 하시면 됩니다
