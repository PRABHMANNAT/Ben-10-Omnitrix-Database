import fs from 'fs';

const path = './src/data/aliens.js';
let content = fs.readFileSync(path, 'utf8');

const sTierImages = {
  "Heatblast": "https://static.wikia.nocookie.net/ben10/images/6/6d/Heatblast_ov.png/revision/latest",
  "NRG": "https://static.wikia.nocookie.net/ben10/images/a/a2/NRG_OV.png/revision/latest",
  "Ultimate Swampfire": "https://static.wikia.nocookie.net/ben10/images/a/ab/Ultimate_Swampfire.png/revision/latest",
  "Ultimate Echo Echo": "https://static.wikia.nocookie.net/ben10/images/e/ef/Ultimate_Echo_Echo_official.png/revision/latest",
  "Ultimate Humungousaur": "https://static.wikia.nocookie.net/ben10/images/4/4c/Ultimate_Humungousaur_official.png/revision/latest",
  "Ultimate Big Chill": "https://static.wikia.nocookie.net/ben10/images/c/c5/Ultimate_big_chill.png/revision/latest",
  "Feedback": "https://static.wikia.nocookie.net/ben10/images/7/7b/Feedback_OV_Official.png/revision/latest",
  "Gravattack": "https://static.wikia.nocookie.net/ben10/images/6/6f/Gravattack_OV_Pose.png/revision/latest",
  "Atomix": "https://static.wikia.nocookie.net/ben10/images/7/71/Atomix_Official.png/revision/latest",
  "Toepick": "https://static.wikia.nocookie.net/ben10/images/8/87/Toepick_OV_Official.png/revision/latest"
};

for (const [name, url] of Object.entries(sTierImages)) {
  const regex = new RegExp(`("name":\\s*"${name}"[\\s\\S]*?"image"\\s*:\\s*)"([^"]*)"`);
  content = content.replace(regex, `$1"${url}"`);
}

fs.writeFileSync(path, content, 'utf8');
console.log('S-tier images updated completely!');
