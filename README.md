
# MOONCO 🌙
> 위치 기반 마감 할인 서비스 - 음식점 사장님의 재고 관리와 고객의 알뜰 구매를 연결합니다.

## 📌 프로젝트 소개
MOONCO는 두 가지 문제를 해결합니다:
- 음식점 사장님: 폐점 시간 임박 재고 처리 고민 해결
- 고객: 품질 좋은 음식을 저렴하게 구매할 기회 제공

자세한 소개는 [여기](https://www.miricanvas.com/ko/v/13r3bod)에서 확인하실 수 있습니다.

## 🏗 서비스 아키텍처
![서비스 아키텍처](https://github.com/user-attachments/assets/dfd2049b-fb62-490d-a5dd-d792b608c3b6)

## 💾 데이터베이스 구조
[![DB Schema](https://drawsql.app/teams/1-524/diagrams/-5/embed)](https://drawsql.app/teams/1-524/diagrams/-5)

## 🛠 기술 스택
### 언어/프레임워크
- TypeScript
- NestJS

### 데이터베이스
- PostgreSQL (Write)
- DynamoDB (Read)
- Redis (Cache)

### AWS 서비스
- Route53
- VPC
- EC2
- RDS
- DynamoDB
- ElastiCache

### DevOps
- GitHub Actions
- Nginx
- Docker
- Docker-Compose

### 데이터 분석/모니터링
- Prometheus
- Grafana
- Node-Exporter
