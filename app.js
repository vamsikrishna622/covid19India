const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "covid19India.db");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

///API 1
app.get("/states/", async (request, response) => {
  const getAllStates = `
    SELECT *
    FROM state;
    `;
  const allStatesList = await db.all(getAllStates);
  response.send(allStatesList);
});

///API 2
app.get("/states/:stateId/", async (request, response) => {
  let { stateId } = request.params;
  stateId = parseInt(stateId);

  const getState = `
    SELECT *
    FROM state
    WHERE
    state_id = ${stateId};
    `;
  const state = await db.get(getState);
  response.send(state);
});

///API 3
app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;

  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;

  const addDistrict = `
  INSERT INTO
  district(districtName,
    stateId,
    cases,
    cured,
    active,
    deaths)
    VALUES
    '${districtName}',
    ${stateId},
    ${cases},
    ${cured},
    ${active},
    ${deaths};
  `;
  const district = await db.run(addDistrict);
  const districtId = district.lastId;
  response.send(District Successfully Added);
});


///API 4
app.get("/districts/:districtId/", async (request, response) {
    let districtId = request.params;
    districtId = parseInt(districtId);

    const getDistrictQuery = `
    SELECT *
    FROM district
    WHERE
    district_id = ${districtId};
    `;
    const district = await db.get(getDistrictQuery);
    response.send(district);
})

///API 5
app.delete("/districts/:districtId/", (request, response) => {
    let districtId = request.params;
    districtId = parseInt(districtId);

    const deleteDistrictQuery = `
    DELETE
    FROM district
    WHERE
    district_id = ${districtId};
    `;
    await db.run(deleteDistrictQuery);
    response.send("District Removed");
})

///API 6
app.put("/districts/:districtId", async (request, response) => {
    const districtDetails = request.body;
    let districtId = request.params;
    districtId = parseInt(districtId);

  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;

  const updateDistrictQuery = `
  UPDATE 
  district
    SET
    districtName='${districtName}',
    stateId=${stateId},
    cases=${cases},
    cured=${cured},
    active=${active},
    deaths=${deaths}
    WHERE
    district_id = ${districtId};
  `;
  const district = await db.run(updateDistrictQuery);
  response.send("District details Updated");
});


///API 7
app.get("/states/:stateId/stats/", async (request, response) => {
    let { stateId } = request.params;
    stateId = parseInt(stateId);

    const getStateStats = `
    SELECT
    cases, cured, active, deaths
    FROM 
    `
})


//API 8
app.get("/districts/:districtId/details/", async (request, response) => {
    let {districtId} = request.params;
    districtId = parseInt(districtId);

    const getStateOfADistrictQuery = `
    SELECT
    state_name
    FROM
    state
    WHERE 
    `
})