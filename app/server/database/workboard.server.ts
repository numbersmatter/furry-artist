import type { Timestamp } from "firebase-admin/firestore";
import { dataPoint, dbBase } from "./db.server";

export interface columnDetails {
  columnId: string;
  columnTitle: string;
  columnDescription: string;
  cardOrder: string[];
}

export interface cardDetails {
  cardId: string;
  cardTitle: string;
  cardType: string;
  workboardId: string;
  archived: boolean;
}

export interface WorkBoardDoc {
  createdAt: Timestamp;
  profileId: string;
  title: string;
  columnData: {
    [key: string]: columnDetails;
  };
  columnOrder: string[];
}

const workboardDb = {
  workBoard: (profileId: string) =>
    dataPoint<WorkBoardDoc>(`${dbBase}/profiles/${profileId}/workboard`),
  cards: (profileId: string) =>
    dataPoint<cardDetails>(`${dbBase}/profiles/${profileId}/cards`),
};

export const createCard = async (
  profileId: string,
  cardDetails: cardDetails
) => {
  const cardRef = workboardDb.cards(profileId).doc(cardDetails.cardId);
  await cardRef.set(cardDetails);
};

export const createWorkboard = async (
  profileId: string,
  workboardDetails: WorkBoardDoc
) => {
  const workboardRef = workboardDb.workBoard(profileId).doc();
  await workboardRef.set(workboardDetails);
};

export const getWorkboardbyId = async ({
  profileId,
  workboardId,
}: {
  profileId: string | undefined;
  workboardId: string | undefined;
}) => {
  if (!profileId || !workboardId) return undefined;
  const workboardRef = workboardDb.workBoard(profileId).doc(workboardId);
  const workboard = await workboardRef.get();
  return workboard.data();
};
