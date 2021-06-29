import { Relationship } from '.prisma/client';
import { RelationshipStatus } from '../constants/user';

export function getStatus(
  relation: Relationship,
  currentUser: string,
): RelationshipStatus {
  if (!relation) {
    return RelationshipStatus.UNRELATED;
  }

  const { status, updatedBy } = relation;
  const updatedByMe = updatedBy === currentUser;

  if (status === RelationshipStatus.PENDING && !updatedByMe) {
    return RelationshipStatus.PENDING_YOU;
  }

  if (status === RelationshipStatus.BLOCKED && !updatedByMe) {
    return RelationshipStatus.BLOCKED_YOU;
  }

  return status;
}
