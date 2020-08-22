const rn_bridge = require("rn-bridge");
const { getData, putData, delData } = require("./db");

rn_bridge.channel.on("message", async (msg) => {
  const { type, timestamp, payload } = parse(msg);
  let result;

  switch (type) {
    case "getData":
      result = await getData(payload);
      break;
    case "putData":
      result = await putData(payload);
      break;
    case "delData":
      result = await delData(payload);
      break;
  }

  const message = format(type, timestamp, result);
  send(message);
});

function parse(message) {
  const [type, timestamp, payload] = message.split("::");
  const payloadParsed = JSON.parse(payload);

  return { type, timestamp, payload: payloadParsed };
}

function format(type, timestamp, payload) {
  return `${type}::${timestamp}::${JSON.stringify({ result: payload })}`;
}

function send(message) {
  rn_bridge.channel.send(message);
}
