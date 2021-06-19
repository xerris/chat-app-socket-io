const bcrypt = require("bcrypt");
const saltRounds = 10;
const pass = "hello";
const pass2 = "hello2";

bcrypt.genSalt(10, (err, salt) => {
  bcrypt.hash(pass, salt, (err, hash) => {
    console.log("🚀 ~ file: bcrypt.ts ~ line 8 ~ bcrypt.hash ~ hash", hash);
  });
});

const hash = "$2b$10$NhWTOb1mASSiRLX2L4IVK.O54vcVxU.MiECBHBJRIcsoeHL2YVRx2";

bcrypt.compare(pass2, hash, (err, result) => {
  console.log(
    "🚀 ~ file: bcrypt.ts ~ line 15 ~ bcrypt.compare ~ result",
    result
  );
});
