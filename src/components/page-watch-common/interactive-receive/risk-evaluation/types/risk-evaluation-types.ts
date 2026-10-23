/** 风险测评-主要弹窗-打开方式 */
export enum RiskEvaluationMainDialogOpenMode {
  /** 手动打开 */
  ManualOpen = 'manual-open',
  /** 超时自动打开 */
  TimeoutAutoOpen = 'timeout-auto-open',
}

/** 风险测评-测评结果 */
export interface QuestionnaireEvaluationResult {
  /** 频道 Id */
  channelId: number;
  /** 用户唯一标识 */
  viewerId: string;
  /** 场次 Id */
  sessionId: string;
  /** 用户昵称 */
  nickname: string;
  /** 测评问卷 Id */
  questionnaireId: string;
  /** 观众测评得分（-1为未测评） */
  score: number;
  /** 当前得分对应的标签描述 */
  scoreLabel: string;
  /** 分数限制对应的标签描述 */
  scoreLabelLimit: string;
  /** 通过直播间风险测评条件（1：通过，0：不通过）  */
  passEvaluation: 0 | 1;
}
