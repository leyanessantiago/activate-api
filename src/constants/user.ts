export enum VerificationLevel {
  UNVERIFIED,
  CODE_VERIFIED,
  USER_INFO_ADDED,
  INTERESTS_ADDED,
}

export enum RelationshipStatus {
  UNRELATED = -1,
  PENDING = 0,
  ACCEPTED = 1,
  BLOCKED = 2,
  BLOCKED_YOU = 4,
  MUTED = 3,
}

export enum FollowerStatus {
  UNRELATED = -1,
  FOLLOWING = 0,
  MUTED = 1,
  BLOCKED = 2,
}
