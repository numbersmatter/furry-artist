import type { Timestamp } from "firebase-admin/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { dataPoint, dbBase } from "./db.server";

export interface ColumnDetails {
  columnTitle: string;
  columnDescription: string;
  cardOrder: string[];
}

export interface ColumnDetailsWID extends ColumnDetails {
  columnId: string;
}

export interface CardDetails {
  cardTitle: string;
  cardType: string;
  workboardId: string;
  archived: boolean;
  userTitle?: string;
  userNotes?: string; 
}

export interface WorkboardDoc {
  createdAt: Timestamp;
  profileId: string;
  title: string;
  columnData: {
    [key: string]: ColumnDetailsWID;
  };
  columnOrder: string[];
}

const workboardDb = {
  workboard: (profileId: string) =>
    dataPoint<WorkboardDoc>(`${dbBase}/profiles/${profileId}/workboard`),
  cards: (profileId: string) =>
    dataPoint<CardDetails>(`${dbBase}/profiles/${profileId}/cards`),
};

export const getCardById = async ({
  profileId,
  cardId,
}: {
  profileId: string | undefined;
  cardId: string | undefined;
}) => {
  if (!profileId || !cardId) return undefined;
  const cardRef = workboardDb.cards(profileId).doc(cardId);
  const cardSnap = await cardRef.get();
  const cardData = cardSnap.data();
  if (!cardData) return undefined;
  return { ...cardData, cardId };
};

export const updateColumnData = async ({
  profileId,
  workboardId,
  columnData,
}: {
  profileId: string;
  workboardId: string;
  columnId: string;
  columnData: {[key: string]: ColumnDetailsWID;};
}) => {
  const workboardRef = workboardDb.workboard(profileId).doc(workboardId);
  await workboardRef.update({
    columnData,
  });
};

export const changeCardLocation = ({
  columnData,
  cardId,
  fromColumn,
  toColumn,
  fromIndex,
  toIndex,
}:{
  columnData: {[key: string]: ColumnDetailsWID;};
  cardId: string;
  fromColumn: string;
  toColumn: string;
  fromIndex: number;
  toIndex: number;
})=>{

  if( fromColumn === toColumn) {
    const columnCardOrder = columnData[fromColumn].cardOrder;
    const newColumnCardOrder = [...columnCardOrder];
    newColumnCardOrder.splice(fromIndex, 1);
    newColumnCardOrder.splice(toIndex, 0, cardId);
    const newColumnData = {
      ...columnData,
      [fromColumn]: {
        ...columnData[fromColumn],
        cardOrder: newColumnCardOrder,
      }
    }

    return newColumnData;
  }

  const newFromColumnCardOrder = [...columnData[fromColumn].cardOrder];
  newFromColumnCardOrder.filter((id) => id !== cardId);

  const newToColumnCardOrder = [...columnData[toColumn].cardOrder];
  newToColumnCardOrder.splice(toIndex, 0, cardId);

  const newColumnData = {
    ...columnData,
    [fromColumn]: {
      ...columnData[fromColumn],
      cardOrder: newFromColumnCardOrder,
    },
    [toColumn]: {
      ...columnData[toColumn],
      cardOrder: newToColumnCardOrder,
    }
  }
  return newColumnData;
}




export const moveCard = async ({
  profileId,
  workboardId,
  cardId,
  fromColumn,
  toColumn,
  fromIndex,
  toIndex,
}: {
  profileId: string;
  workboardId: string;
  cardId: string;
  fromColumn: string;
  toColumn: string;
  fromIndex: number;
  toIndex: number;
}) => {
  const workboardRef = workboardDb.workboard(profileId).doc(workboardId);
  const workboardSnap = await workboardRef.get();
  const workboard = workboardSnap.data();
  if (!workboard) return;

  if( fromColumn === toColumn) {
    const columnCardOrder = workboard.columnData[fromColumn].cardOrder;
    const newColumnCardOrder = [...columnCardOrder];
    newColumnCardOrder.splice(fromIndex, 1);
    newColumnCardOrder.splice(toIndex, 0, cardId);
    const updateData = {
      [`columnData.${fromColumn}.cardOrder`]: newColumnCardOrder,
    };
    // @ts-ignore
    await workboardRef.update(updateData);
    return;
    
  } 
  const destinationColumnOrder = workboard.columnData[toColumn].cardOrder;
  
  const newDestinationColumnCardOrder = [...destinationColumnOrder];
  newDestinationColumnCardOrder.splice(toIndex, 0, cardId); 
  
  const updateData = {
    [`columnData.${fromColumn}.cardOrder`]: FieldValue.arrayRemove(cardId),
    [`columnData.${toColumn}.cardOrder`]: newDestinationColumnCardOrder,
  }
  // @ts-ignore
  await workboardRef.update(updateData);
  return;

};
export const createCard = async (
  profileId: string,
  cardDetails: CardDetails
) => {
  const cardRef = workboardDb.cards(profileId).doc();
  await cardRef.set(cardDetails);
  return { cardId: cardRef.id };
};

export const getCardsforWorkboard = async ({
  profileId,
  workboardId,
}: {
  profileId: string;
  workboardId: string;
}) => {
  const cardsRef = workboardDb.cards(profileId).where("workboardId", "==", workboardId);
  const cardsSnap = await cardsRef.get();
  const cards = cardsSnap.docs.map((doc) => ({...doc.data(), cardId: doc.id}));
  return cards;
};


export const addSubmissionToWorkboard = async ({
  profileId,
  workboardId,
  cardId,
  cardDetails,
}: {
  profileId: string;
  workboardId: string;
  cardId: string;
  cardDetails: CardDetails;
}) => {
  const workboardRef = workboardDb.workboard(profileId).doc(workboardId);
  const workboardSnap =  await workboardRef.get();
  const workboard = workboardSnap.data();
  if (!workboard) return;
  const columnId = workboard.columnOrder[0];

  const cardRef = workboardDb.cards(profileId).doc(cardId);
  await cardRef.set(cardDetails);
  
  const updateData = {
    [`columnData.${columnId}.cardOrder`]: FieldValue.arrayUnion(cardId),
  };
  await workboardRef.update(updateData);
}


export const createWorkboard = async (
  profileId: string,
  workboardDetails: WorkboardDoc
) => {
  const workboardRef = workboardDb.workboard(profileId).doc();
  await workboardRef.set(workboardDetails);
};

export const addColumnToWorkboard = async ({
  profileId,
  workboardId,
  columnData,
}: {
  profileId: string;
  workboardId: string;
  columnData: ColumnDetails;
}) => {
  const workboardRef = workboardDb.workboard(profileId).doc(workboardId);

  const columnId = workboardRef.collection("columns").doc().id;
  const columnDetails: ColumnDetailsWID = {
    ...columnData,
    columnId,
  };
  await workboardRef.update({
    [`columnData.${columnId}`]: columnDetails,
    columnOrder: FieldValue.arrayUnion(columnId),
  });
};

export const getWorkboardbyId = async ({
  profileId,
  workboardId,
}: {
  profileId: string | undefined;
  workboardId: string | undefined;
}) => {
  if (!profileId || !workboardId) return undefined;
  const workboardRef = workboardDb.workboard(profileId).doc(workboardId);
  const workboardSnap = await workboardRef.get();
  const workboard = workboardSnap.data();

  return workboard;
};
