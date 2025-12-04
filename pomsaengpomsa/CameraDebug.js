// 디버깅용 간단한 테스트 파일
// 래그돌 각도 시스템 이해하기

/*
래그돌 구조:
- leftShoulder = PI (180도) : 왼쪽 수평
- leftShoulder = PI/2 (90도) : 위로
- leftShoulder = 3*PI/2 (270도) : 아래로

- rightShoulder = 0 (0도) : 오른쪽 수평  
- rightShoulder = PI/2 (90도) : 아래로
- rightShoulder = -PI/2 (-90도) : 위로

카메라(PoseNet):
- 좌표: (x, y)
- atan2(y2-y1, x2-x1)로 각도 계산
- 오른쪽 = 0도, 위 = -90도, 왼쪽 = 180도, 아래 = 90도

변환 필요:
1. PoseNet left/right는 좌우 반전됨
2. Y축 방향이 반대 (위가 작은 값)
*/
