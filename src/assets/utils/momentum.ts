export default class Momentum {
  // 滑动开始时 X 轴偏离值
  private momentumStartDiffX = 0;
  // 滑动开始时 Y 轴偏离值
  private momentumStartDiffY = 0;
  // 滑动开始时间
  private momentumStartTime: number | undefined = undefined;
  // 滑动开始时 X 轴偏离值
  private momentumEndDiffX = 0;
  // 滑动开始时 Y 轴偏离值
  private momentumEndDiffY = 0;

  // 惯性滑动时间阀值
  private momentumTimeThreshold = 300;
  // 惯性滑动距离阀值
  private momentumMoveThreshold = 15;
  // 惯性滑动的持续时间
  private momentumTransitionDuration = 0;
  // 惯性滑动贝塞尔曲线
  private momentumBezier = '';

  onMomentumStart(X: number, Y: number) {
    this.stopMomentum();
    this.momentumTransitionDuration = 0;
    this.momentumStartDiffX = X;
    this.momentumStartDiffY = Y;
    this.momentumStartTime = Date.now();
    this.momentumBezier = '';
  }

  // onMomentumMove() {
  //   if (!this.momentumStartTime) {
  //     return;
  //   }
  //   const now = Date.now();
  //
  //   if (now - this.momentumStartTime > this.momentumTimeThreshold) {
  //     this.momentumStartTime = now;
  //     this.momentumStartDiffX = this.centerDiffX;
  //     this.momentumStartDiffY = this.centerDiffY;
  //   }
  // }

  onMomentumEnd(endX: number, endY: number) {
    if (!this.momentumStartTime) {
      return;
    }
    this.momentumEndDiffX = endX;
    this.momentumEndDiffY = endY;

    // XY轴的滑动距离
    const moveDiffX = Math.abs(this.momentumEndDiffX - this.momentumStartDiffX);
    const moveDiffY = Math.abs(this.momentumEndDiffY - this.momentumStartDiffY);
    // 滑动时间
    const moveDuration = Date.now() - this.momentumStartTime;
    // XY轴之一超出惯性阀值
    const isOverMoveThreshold =
      moveDiffX > this.momentumMoveThreshold || moveDiffY > this.momentumMoveThreshold;

    // XY轴运动距离超出惯性阀值，滑动时间小于阀值
    if (isOverMoveThreshold && moveDuration < this.momentumTimeThreshold) {
      const transition = this.momentumTransition();
      this.momentumTransitionDuration = transition.duration;
      this.momentumBezier = transition.bezier;

      let _centerDiffX = this.momentumEndDiffX;
      let _centerDiffY = this.momentumEndDiffY;

      // X 轴启动惯性
      if (moveDiffX > this.momentumMoveThreshold) {
        _centerDiffX = this.momentum(this.momentumEndDiffX, this.momentumStartDiffX, moveDuration);
      }

      // Y 轴启动惯性
      if (moveDiffY > this.momentumMoveThreshold) {
        _centerDiffY = this.momentum(this.momentumEndDiffY, this.momentumStartDiffY, moveDuration);
      }

      return {
        _centerDiffX,
        _centerDiffY,
        momentumTransitionDuration: this.momentumTransitionDuration,
        momentumBezier: this.momentumBezier,
      };
    }
  }

  // 获取惯性运动的动画曲线
  private momentumTransition() {
    const durationMap = {
      noBounce: 2500,
      weekBounce: 800,
      strongBounce: 400,
    };
    const bezierMap = {
      noBounce: 'cubic-bezier(.17, .89, .45, 1)',
      weekBounce: 'cubic-bezier(.25, .46, .45, .94)',
      strongBounce: 'cubic-bezier(.25, .46, .45, .94)',
    };
    const type = 'weekBounce';

    return {
      duration: durationMap[type],
      bezier: bezierMap[type],
    };
  }

  private momentum(current: number, start: number, duration: number) {
    // 惯性滑动加速度
    const deceleration = 0.003;

    const distance = current - start;
    const speed = (2 * Math.abs(distance)) / duration;
    const destination = current + (speed / deceleration) * (distance < 0 ? -1 : 1);

    return Math.round(destination);
  }

  // 停止惯性滑动
  stopMomentum() {
    this.momentumTransitionDuration = 0;
    this.momentumBezier = '';
  }
}
