import axios from "axios";
import { getWaterRestrictionData, waterRestrictionType, waterRestrictionTypeResponse } from "./Sanepar/main";
import { getText } from "./utils";

const main = async () => {
  const now = new Date();
  try {
    console.log(`${now}: Starting service...`);

    const botToken = "1633826227:AAHpeOwnacJS6R9PCGY0iEFsqq1kpi8xxjg";
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const chat_id = -1001285508996;
    const retryNumber = 5;

    let triesCount = 1;
    let waterRestrictionData: waterRestrictionTypeResponse[];
    while (triesCount <= retryNumber) {
      waterRestrictionData = await getWaterRestrictionData(
        'Coronel Dulcidio 1179'
      );
      if (waterRestrictionData[0].attributes !== undefined) {
        console.log(`${now}: Got water data. ${JSON.stringify(waterRestrictionData)}`);
        break
      }

      console.log(`${now}: Failed to get Sanepar data. Try number: ${triesCount}.`);
      console.log(JSON.stringify(waterRestrictionData));
      triesCount++;
    }

    if (waterRestrictionData[0].attributes === undefined) {
      console.log(`${now}: Failed to get Sanepar Data. Sending failed message.`);
    }

    const formattedData: waterRestrictionType[] = waterRestrictionData
      .sort((a, b) => {
        return a.attributes.INICIO - b.attributes.INICIO
      })
      .map(data => {
        return {
          attributes: {
            ...data.attributes,
            RETOMADA: new Date(data.attributes.RETOMADA),
            NORMALIZACAO: new Date(data.attributes.NORMALIZACAO),
            INICIO: new Date(data.attributes.INICIO)
          }
        }
      })
      .filter(data => {
        const isMayFifth = 
          data.attributes.INICIO.getDate() === 5 &&
          data.attributes.INICIO.getMonth() + 1 === 5;
        return !isMayFifth;
      })

    console.log(`${now}: Formatted water data. ${JSON.stringify(formattedData)}`);
    const text = getText(formattedData);

    const params = {
      chat_id,
      text,
    };

    console.log(`${now}: Sending message. ${text}`);
    //axios.post(url, params);
  } catch (e) {
    console.error(`${now}: ERROR! ${e}`);
  }
}

main();