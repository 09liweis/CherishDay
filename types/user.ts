export type RelationshipStatus = 'pending' | 'accept' | 'reject';

export interface Relationship {
  userId: string,
  friendId: string,
  status: RelationshipStatus,
}