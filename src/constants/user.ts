export enum VerificationLevel {
  UNVERIFIED = -1,
  CODE_VERIFIED = 1,
  USER_INFO_ADDED = 2,
  INTERESTS_ADDED = 3,
}

export enum RelationshipStatus {
  UNRELATED = -1,
  PENDING = 1,
  PENDING_YOU = 2,
  ACCEPTED = 3,
  BLOCKED = 4,
  BLOCKED_YOU = 5,
  MUTED = 6,
}

export enum FollowerStatus {
  UNRELATED = -1,
  FOLLOWING = 1,
  MUTED = 2,
  BLOCKED = 3,
}
