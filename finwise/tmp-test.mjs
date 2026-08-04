import * as C from "react-countup";
console.log("keys", Object.keys(C));
console.log("default typeof", typeof C.default);
console.log("default name", C.default && C.default.name);
console.log("default keys", C.default && Object.keys(C.default));
console.log("default default typeof", C.default && typeof C.default.default);
