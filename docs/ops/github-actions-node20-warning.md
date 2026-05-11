# GitHub Actions Node 20 경고 추적

## 요약

최근 Pages 배포(`run: 25661058576`)에서는 배포가 성공했지만, 애너테이션 경고로 Node.js 20 폐기 관련 메시지와
`actions/upload-artifact`의 Node 24 강제(현재 env와 호환 플래그) 관련 문구가 함께 남았습니다.
이 경고는 애플리케이션 기능 실패가 아니라 워크플로 실행 환경 알림입니다.

## 현재 조치

- 워크플로우는 `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: "true"` 환경 변수를 설정해 호환 가능한 JavaScript 액션을 Node 24로 강제 실행합니다.
- 동일 워크플로우에서 `actions/upload-pages-artifact@v4` 기반 배포는 현재 성공적으로 완료됩니다.

## 추적 포인트

- 경고는 즉시 치명적 오류가 아니며, 배포는 실패하지 않습니다.
- 상위 액션의 `Node.js 20` 내부 타깃 강제 정책은 GitHub 측 사정에 따라 사라질 수 있어, 조치는 추후 **업스트림에서 내부 Node 20 타깃이 제거된 뒤** 재확인합니다.
- 경고를 앱 오류로 오해하지 말고, workflow 실행 로그의 경고로만 모니터링합니다.
