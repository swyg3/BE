
# MOONCO 🌙
> 위치 기반 마감 할인 서비스 - 음식점 사장님의 재고 관리와 고객의 알뜰 구매를 연결합니다.

## 📋 목차
- [프로젝트 소개](#-프로젝트-소개)
- [프로젝트 문서](#-프로젝트-문서)
- [기술 스택](#-기술-스택)
- [시스템 아키텍처](#-시스템-아키텍처)
- [데이터베이스 구조](#-데이터베이스-구조)


## 📌 프로젝트 소개
MOONCO는 두 가지 문제를 해결합니다:
- 음식점 사장님: 폐점 시간 임박 재고 처리 고민 해결
- 고객: 품질 좋은 음식을 저렴하게 구매할 기회 제공

## 📚 프로젝트 문서

- [프로젝트 소개 슬라이드](https://www.miricanvas.com/ko/v/13r3bod)
- [팀 노션 페이지](https://plucky-gear-406.notion.site/Moonco-ca4ff5ccc8004f3da53925e62f8d61ad)

## 🛠 기술 스택

### Backend
- ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=TypeScript&logoColor=white)
- ![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=NestJS&logoColor=white)

### Database
- ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=PostgreSQL&logoColor=white) (Write)
- ![DynamoDB](https://img.shields.io/badge/DynamoDB-4053D6?style=flat-square&logo=Amazon%20DynamoDB&logoColor=white) (Read)
- ![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=Redis&logoColor=white) (Cache)

### Infrastructure (AWS)
- Route53
- VPC
- EC2
- RDS
- DynamoDB
- ElastiCache

### DevOps
- ![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?style=flat-square&logo=GitHub%20Actions&logoColor=white)
- ![Nginx](https://img.shields.io/badge/Nginx-009639?style=flat-square&logo=Nginx&logoColor=white)
- ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=Docker&logoColor=white)

### Monitoring
- ![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=flat-square&logo=Prometheus&logoColor=white)
- ![Grafana](https://img.shields.io/badge/Grafana-F46800?style=flat-square&logo=Grafana&logoColor=white)
- Node-Exporter
  
## 📌 팀 노션 
https://plucky-gear-406.notion.site/Moonco-ca4ff5ccc8004f3da53925e62f8d61ad

## 🏗 서비스 아키텍처
주요 특징:
- CQRS 패턴을 통한 읽기/쓰기 분리
- Redis 캐싱을 통한 성능 최적화
- AWS 클라우드 인프라 활용

## 💾 데이터베이스 구조

### Write Database (PostgreSQL)
![Write DB 구조](https://github.com/user-attachments/assets/3b166f1d-7ab7-4f39-9f06-d908feaa5ec3)

### Read Database (DynamoDB)
![Read DB 구조](https://github.com/user-attachments/assets/a8d33340-e12b-4743-a8b3-f8f1bd7f70d2)


