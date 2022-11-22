export const GameTournaments = {
  WorldCup2018: {
      name: "World Cup 2018",
      matchStages: [
        //Groupstage match day1
        {
          MatchNumber: 1,
          Desc: 'Groupstage first match',
          StageStartDate: 'June 14, 2018',
          StageEndDate: 'June 19, 2018',
          Stage: 0,
          ScoreAndWinnerPoints: 3,
          WinnerOnlyPoints: 1,
          LostPoints: 0
        },
        //Groupstage match day2
        {
          MatchNumber: 17,
          Desc: 'Groupstage second match',
          StageStartDate: 'June 19, 2018',
          StageEndDate: 'June 24, 2018',
          Stage: 1,
          ScoreAndWinnerPoints: 3,
          WinnerOnlyPoints: 1,
          LostPoints: 0
        },
        //Groupstage match day3
        {
          MatchNumber: 31,
          Desc: 'Groupstage thrid match',
          StageStartDate: 'June 25, 2018',
          StageEndDate: 'June 28, 2018',
          Stage: 2,
          ScoreAndWinnerPoints: 3,
          WinnerOnlyPoints: 1,
          LostPoints: 0
        },
        //round 16
        {
          MatchNumber: 49,
          Desc: 'Round of 16',
          StageStartDate: 'June 30, 2018',
          StageEndDate: 'July 3, 2018',
          Stage: 3,
          ScoreAndWinnerPoints: 3,
          WinnerOnlyPoints: 1,
          LostPoints: 0
        },
        //quarter finals
        {
          MatchNumber: 57,
          Desc: 'Quarter finals',
          StageStartDate: 'July 6, 2018',
          StageEndDate: 'July 7, 2018',
          Stage: 4,
          ScoreAndWinnerPoints: 5,
          WinnerOnlyPoints: 3,
          LostPoints: -1
        },
        //semi finals
        {
          MatchNumber: 61,
          Desc: 'Semi finals',
          StageStartDate: 'July 10, 2018',
          StageEndDate: 'July 12, 2018',
          Stage: 5,
          ScoreAndWinnerPoints: 15,
          WinnerOnlyPoints: 5,
          LostPoints: -5
        },
        //winner & loser finals
        {
          MatchNumber: 63,
          Desc: 'Finals',
          StageStartDate: 'July 14, 2018',
          StageEndDate: 'July 15, 2018',
          Stage: 6,
          ScoreAndWinnerPoints: 40,
          WinnerOnlyPoints: 15,
          LostPoints: -10,
          IsFinal: 'True'
        }
      ],
  },
  EuroCup2020: {
      name: "Euro Cup 2020",
      matchStages: [
        {
          //stage1
          MatchNumber: 1,
          Desc: 'Groupstage',
          StageStartDate: 'June 11, 2021',
          StageEndDate: 'June 23, 2021',
          Stage: 0,
          ScoreAndWinnerPoints: 3,
          WinnerOnlyPoints: 1,
          LostPoints: 0
        },
        {
          //round of 16
          MatchNumber: 37,
          Desc: 'Round of 16',
          StageStartDate: 'June 26, 2021',
          StageEndDate: 'June 30, 2021',
          Stage: 1,
          ScoreAndWinnerPoints: 3,
          WinnerOnlyPoints: 1,
          LostPoints: 0
        },
        {
          //quarter-finals
          MatchNumber: 45,
          Desc: 'Quarter finals',
          StageStartDate: 'July 2, 2021',
          StageEndDate: 'July 4, 2021',
          Stage: 2,
          ScoreAndWinnerPoints: 5,
          WinnerOnlyPoints: 3,
          LostPoints: -1
        },
        {
          //semi-finals
          MatchNumber: 49,
          Desc: 'Semi finals',
          StageStartDate: 'July 7, 2021',
          StageEndDate: 'July 8, 2021',
          Stage: 3,
          ScoreAndWinnerPoints: 15,
          WinnerOnlyPoints: 5,
          LostPoints: -5
        },
        {
          //finals
          MatchNumber: 51,
          Desc: 'Finals',
          StageStartDate: 'July 12, 2021',
          StageEndDate: 'July 12, 2021',
          Stage: 4,
          ScoreAndWinnerPoints: 40,
          WinnerOnlyPoints: 15,
          LostPoints: -10,
          IsFinal: 'True'
        }
      ],
  },
  WorldCup2022: {
      name: "World Cup 2022",
      matchStages: [
        //Groupstage match day1
        {
          MatchNumber: 1,
          Desc: 'Groupstage first match',
          StageStartDate: 'November 21, 2022',
          StageEndDate: 'November 24, 2022',
          Stage: 1,
          ScoreAndWinnerPoints: 3,
          WinnerOnlyPoints: 1,
          LostPoints: 0
        },
        //Groupstage match day2
        {
          MatchNumber: 17,
          Desc: 'Groupstage second match',
          StageStartDate: 'November 25, 2022',
          StageEndDate: 'November 28, 2022',
          Stage: 2,
          ScoreAndWinnerPoints: 3,
          WinnerOnlyPoints: 1,
          LostPoints: 0
        },
        //Groupstage match day3
        {
          MatchNumber: 34,
          Desc: 'Groupstage thrid match',
          StageStartDate: 'November 29, 2022',
          StageEndDate: 'December 2, 2022',
          Stage: 3,
          ScoreAndWinnerPoints: 3,
          WinnerOnlyPoints: 1,
          LostPoints: 0
        },
        //round 16
        {
          MatchNumber: 50,
          Desc: 'Round of 16',
          StageStartDate: 'December 3, 2022',
          StageEndDate: 'December 6, 2022',
          Stage: 4,
          ScoreAndWinnerPoints: 3,
          WinnerOnlyPoints: 1,
          LostPoints: 0
        },
        //quarter finals
        {
          MatchNumber: 58,
          Desc: 'Quarter finals',
          StageStartDate: 'December 9, 2022',
          StageEndDate: 'December 10, 2022',
          Stage: 5,
          ScoreAndWinnerPoints: 5,
          WinnerOnlyPoints: 3,
          LostPoints: -1
        },
        //semi finals
        {
          MatchNumber: 62,
          Desc: 'Semi finals',
          StageStartDate: 'December 13, 2022',
          StageEndDate: 'December 14, 2022',
          Stage: 6,
          ScoreAndWinnerPoints: 15,
          WinnerOnlyPoints: 5,
          LostPoints: -5
        },
        //winner & loser finals
        {
          MatchNumber: 64,
          Desc: 'Finals',
          StageStartDate: 'December 17, 2022',
          StageEndDate: 'December 18, 2022',
          Stage: 7,
          ScoreAndWinnerPoints: 40,
          WinnerOnlyPoints: 15,
          LostPoints: -10,
          IsFinal: 'True'
        }
      ],
  }
}

export const teamNameAcronymn = {
  'Argentina': 'ARG',
  'Australia': 'AUS',
  'Austria': 'AUT',
  'Belgium': 'BEL',
  'Brazil': 'BRA',
  'Cameroon': 'CMR',
  'Canada': 'CAN',
  'Colombia': 'COL',
  'Costa Rica': 'CRC',
  'Croatia': 'CRO',
  'Czech Republic': 'CZE',
  'Denmark': 'DEN',
  'Egypt': 'EGY',
  'England': 'ENG',
  'Ecuador': 'ECU',
  'France': 'FRA',
  'Finland': 'FIN',
  'Ghana': 'GHA',
  'Germany': 'GER',
  'Hungary': 'HUN',
  'Iceland': 'ISL',
  'Iran': 'IRN',
  'Italy': 'ITA',
  'Japan': 'JPN',
  'Korea Republic': 'KOR',
  'South Korea': 'KOR',
  'Mexico': 'MEX',
  'Morocco': 'MAR',
  'Nigeria': 'NGA',
  'Netherlands': 'NED',
  'North Macedonia': 'MKD',
  'Panama': 'PAN',
  'Peru': 'PER',
  'Poland': 'POL',
  'Portugal': 'POR',
  'Qatar': 'QAT',
  'Russia': 'RUS',
  'Saudi Arabia': 'KSA',
  'Scotland': 'SCO',
  'Senegal': 'SEN',
  'Serbia': 'SRB',
  'Spain': 'ESP',
  'Sweden': 'SWE',
  'Slovakia': 'SVK',
  'Switzerland': 'SUI',
  'Tunisia': 'TUN',
  'Turkey': 'TUR',
  'Uruguay': 'URU',
  'Ukraine': 'UKR',
  'Wales': 'WAL',
  'United States': 'USA',
  'TBD': 'TBD',
}

//Look at the folder /img/country-flags-main/* 
//for the SVG name
export var team2LetterAcronym = {
  'Argentina': 'ar',
  'Australia': 'au',
  'Austria': 'at',
  'Belgium': 'be',
  'Brazil': 'br',
  'Cameroon': 'cm',
  'Canada': 'ca',
  'Colombia': 'co',
  'Costa Rica': 'cr',
  'Croatia': 'hr',
  'Czech Republic': 'cz',
  'Denmark': 'dk',
  'Ecuador': 'ec',
  'Egypt': 'eg',
  'England': 'gb',
  'France': 'fr',
  'Finland': 'fi',
  'Ghana': 'gh',
  'Germany': 'de',
  'Hungary': 'hu',
  'Iceland': 'is',
  'Iran': 'ir',
  'Italy': 'it',
  'Japan': 'jp',
  'Korea Republic': 'kp',
  'South Korea': 'kr',
  'Mexico': 'mx',
  'Morocco': 'ma',
  'Nigeria': 'ng',
  'Netherlands': 'nl',
  'North Macedonia': 'mk',
  'Panama': 'pa',
  'Peru': 'pe',
  'Poland': 'pl',
  'Portugal': 'pt',
  'Qatar': 'qa',
  'Russia': 'ru',
  'Saudi Arabia': 'sa',
  'Scotland': 'gb-sct',
  'Senegal': 'sn',
  'Serbia': 'rs',
  'Spain': 'es',
  'Sweden': 'se',
  'Slovakia': 'sk',
  'Switzerland': 'ch',
  'Tunisia': 'tn',
  'Turkey': 'tr',
  'Uruguay': 'uy',
  'Ukraine': 'ua',
  'Wales': 'gb-wls',
  'United States': 'us',
}

export const team3To2LetterAcronym = {
  'ARG':'ar',
  'AUS':'au',
  'AUT':'at',
  'BEL':'be',
  'BRA':'br',
  'CMR':'cr',
  'CAN':'ca',
  'COL':'co',
  'CRC':'cr',
  'CRO':'hr',
  'CZE':'cz',
  'DEN':'dk',
  'EGY':'ec',
  'ENG':'eg',
  'ECU':'gb',
  'FRA':'fr',
  'FIN':'fi',
  'GHA':'gh',
  'GER':'de',
  'HUN':'hu',
  'ISL':'is',
  'IRN':'ir',
  'ITA':'it',
  'JPN':'jp',
  'KOR':'kr',
  'MEX':'mx',
  'MAR':'ma',
  'NGA':'ng',
  'NED':'nl',
  'MKD':'mk',
  'PAN':'pa',
  'PER':'pe',
  'POL':'pl',
  'POR':'pt',
  'QAT':'qa',
  'RUS':'ru',
  'KSA':'sa',
  'SCO':'gb-sct',
  'SEN':'sn',
  'SRB':'rs',
  'ESP':'es',
  'SWE':'se',
  'SVK':'sk',
  'SUI':'ch',
  'TUN':'tn',
  'TUR':'tr',
  'URU':'uy',
  'UKR':'ua',
  'WAL':'gb-wls',
  'USA':'us',
  'TBD':'TBD',
}