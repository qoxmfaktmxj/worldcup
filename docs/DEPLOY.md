# 배포 (worldcup.minseok91.cloud)

개인 서버에서 Docker + Caddy로 배포한다. 아카이브는 정적 SSG라 런타임 의존성이 거의 없다.

## 사전 준비
1. DNS: `worldcup.minseok91.cloud` A 레코드를 서버 공인 IP로 지정.
2. 서버에 Docker + Docker Compose 설치.
3. 서버 방화벽에서 80, 443 포트 개방 (Caddy 자동 HTTPS 발급에 필요).

## 배포
```bash
git clone <repo> worldcup && cd worldcup
docker compose up -d --build
```
- `app` 컨테이너: Next.js standalone 서버(:3000, 내부 노출).
- `caddy` 컨테이너: 80/443 수신, `app:3000`으로 리버스 프록시, Let's Encrypt 인증서 자동 발급/갱신.

## 확인
```bash
docker compose ps
curl -I https://worldcup.minseok91.cloud
```

## 데이터 갱신
`data/generated/2002/*.json`은 레포에 커밋되어 있어 이미지 빌드에 그대로 포함된다.
원본을 다시 받아 재생성하려면 로컬에서:
```bash
npm run data:build   # fetch + generate + validate
git commit -am "data: refresh"
```
그 후 서버에서 `docker compose up -d --build`로 재배포.

## 참고
- 빌드 시 네트워크 불필요(커밋된 generated JSON 사용). `data:fetch`는 로컬 갱신 시에만.
- 향후 2026 라이브/채팅(ws) 추가 시 `app` 컨테이너에 별도 서비스 추가 + Caddy 라우팅 확장.
