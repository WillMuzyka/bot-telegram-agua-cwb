import { waterRestrictionType } from "./Sanepar/main";

interface TextListProps {
  type: 'nowGood' | 'good' | 'lastGood' | 'bad' | 'stillBad';
  refDate: Date;
}

interface Dates {
  startDate: Date;
  endDate: Date;
  nextStartDate: Date;
  nextEndDate: Date;
  today: Date;
  beforeStartDate: Date;
  beforeNextStartDate: Date;
  previousEndDate: Date;
}

const daysOfWeek = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

const getDaysInMonth = () => {
  const newDate = new Date();
  return new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
}

const getFormattedDate = (date: Date) => {
  if (date === null) return "só Deus sabe quando"
  return `${daysOfWeek[date.getDay()]} - ${date.getDate()}/${date.getMonth() + 1}`;
}

const textList = ({ type, refDate }: TextListProps) => {
  const okEmoji = "🐬";
  const alertEmoji = "🚧";
  const warningEmoji = "🚱";

  const waterEmoji = "💧";
  const waveEmoji = "🌊";
  const dryEmoji = "🐪";
  const sadEmoji = "🥺";
  const noWaterEmoji = "🌵";

  const formattedDate = getFormattedDate(refDate);

  const texts = {
    nowGood: `${okEmoji} Hoje voltou a água! Próximo rodízio será ${formattedDate}! ${waterEmoji}`,
    good: `${okEmoji} É chuva! Hoje temos água. Lembre-se: ${formattedDate} tem novo rodízio começando as 16h! ${waveEmoji}`,
    lastGood: `${okEmoji} Hoje ainda temos água! Amanhã (${formattedDate}) tem novo rodízio começando as 16h! ${dryEmoji}`,
    bad: `${alertEmoji} Hoje começa um novo rodízio às 16h, vamos economizar! Ele acaba ${formattedDate}. ${sadEmoji}`,
    stillBad: `${warningEmoji} Hoje ainda estamos em rodízio. Amanhã (${formattedDate}) já estará normalizado. ${noWaterEmoji}`,
  };

  return texts[type];
}

const getDates = (data: waterRestrictionType[]): Dates => {
  const today = new Date();
  let datesObj = {
    startDate: null,
    endDate: null,
    nextStartDate: null,
    nextEndDate: null,
    timeWithWater: 2
  };

  let haveValidDates = false;
  let triesCount = 0;

  while (!haveValidDates) {
    try {
      datesObj.startDate = data[triesCount].attributes.INICIO;
      datesObj.endDate = data[triesCount].attributes.NORMALIZACAO;
      datesObj.nextStartDate = data[triesCount + 1]?.attributes.INICIO || null;
      datesObj.nextEndDate = data[triesCount + 1]?.attributes.NORMALIZACAO || null;
    } catch(e) {
      throw new Error(`Variable triesCount out of bondaries. triesCount = ${triesCount}`);
    }
    if (datesObj.endDate.getTime() > today.getTime()) haveValidDates = true;
    datesObj.nextStartDate !== null ?
      datesObj.timeWithWater = datesObj.nextStartDate.getDate() - datesObj.endDate.getDate() :
      datesObj.timeWithWater = 2;
    triesCount++;
  }

  const beforeStartDate = new Date(datesObj.startDate);
  beforeStartDate.setDate(datesObj.startDate.getDate() - 1);

  const previousEndDate = new Date(datesObj.startDate);
  previousEndDate.setDate(datesObj.startDate.getDate() - datesObj.timeWithWater);

  if (datesObj.nextEndDate === null) {
    datesObj.nextStartDate = new Date(datesObj.startDate);
    datesObj.nextStartDate.setDate(datesObj.endDate.getDate() + datesObj.timeWithWater);
    datesObj.nextEndDate = new Date(datesObj.nextStartDate);
    datesObj.nextEndDate.setDate(datesObj.endDate.getDate() + 2); //It always last 2 days
  }

  const beforeNextStartDate = new Date(datesObj.nextStartDate);
  beforeNextStartDate.setDate(datesObj.nextStartDate.getDate() - 1);

  return {
    startDate: datesObj.startDate,
    endDate: datesObj.endDate,
    nextStartDate: datesObj.nextStartDate,
    nextEndDate: datesObj.nextEndDate,
    today: today,
    beforeStartDate: beforeStartDate,
    beforeNextStartDate: beforeNextStartDate,
    previousEndDate: previousEndDate,
  }
}

const getTypeDay = (dates: Dates): TextListProps => {
  const {
    today,
    startDate,
    endDate,
    nextStartDate,
    nextEndDate,
    beforeStartDate,
    beforeNextStartDate,
    previousEndDate,
  } = dates;
  if (today.getDate() === previousEndDate.getDate()) {
    return { type: 'nowGood', refDate: startDate };
  } else if (today.getTime() < beforeStartDate.getTime()) {
    return { type: 'good', refDate: startDate };
  } else if (today.getDate() === beforeStartDate.getDate()) {
    return { type: 'lastGood', refDate: startDate };
  } else if (today.getDate() === startDate.getDate()) {
    return { type: 'bad', refDate: endDate };
  } else if (today.getTime() > startDate.getTime() && today.getTime() < endDate.getTime()) {
    return { type: 'stillBad', refDate: endDate };
  } else if (today.getDate() === endDate.getDate()) {
    return { type: 'nowGood', refDate: nextStartDate };
  } else if (today.getTime() > endDate.getTime() && today.getTime() < beforeNextStartDate.getTime()) {
    return { type: 'good', refDate: nextStartDate };
  } else if (today.getDate() === beforeNextStartDate.getDate()) {
    return { type: 'lastGood', refDate: nextStartDate };
  } else if (today.getDate() === nextStartDate.getDate()) {
    return { type: 'bad', refDate: nextEndDate };
  } else {
    throw new Error('Date outside bondaries.');
  }
}

export const getText = (data: waterRestrictionType[]) => {
  const dates = getDates(data);
  const typeDay = getTypeDay(dates);
  // console.log(dates);
  // for (let n = 0; n < 8; n++) {
  //   const nextToday = dates.today.getDate() + n;
  //   const today = new Date();
  //   today.setDate(nextToday)
  //   const typeDayTest = getTypeDay({
  //     ...dates,
  //     today
  //   });
  //   console.log(today, textList(typeDayTest));
  // }

  return textList(typeDay);
}

