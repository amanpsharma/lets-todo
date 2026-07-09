import Notification from "@/models/Notification";

type NotificationType = "chat" | "shared" | "completed" | "subtask" | "mention";

export async function createNotification({
  userId,
  type,
  title,
  body,
  link = "",
}: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
}) {
  try {
    await Notification.create({ userId, type, title, body, link });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

export async function notifyCollaborators({
  todoId,
  todoTitle,
  actorUserId,
  actorName,
  ownerUserId,
  sharedWith,
  type,
  body,
  link = "",
}: {
  todoId: string;
  todoTitle: string;
  actorUserId: string;
  actorName: string;
  ownerUserId: string;
  sharedWith: { userId: string }[];
  type: NotificationType;
  body: string;
  link?: string;
}) {
  // Collect all users to notify (owner + collaborators, excluding the actor)
  const userIds = new Set<string>();

  if (ownerUserId !== actorUserId) {
    userIds.add(ownerUserId);
  }

  for (const s of sharedWith) {
    if (s.userId !== actorUserId) {
      userIds.add(s.userId);
    }
  }

  const promises = Array.from(userIds).map((uid) =>
    createNotification({
      userId: uid,
      type,
      title: todoTitle,
      body,
      link,
    })
  );

  await Promise.allSettled(promises);
}
