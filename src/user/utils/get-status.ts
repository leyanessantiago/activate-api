import { Relationship } from '.prisma/client';
import { RelationshipStatus } from '../../constants/user';

export default function getStatus(
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

  return status;
}
