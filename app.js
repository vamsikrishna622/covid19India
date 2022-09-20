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
  const convertDbObjToResponseObj = (allStatesList) => {
    let statesList = [];
    for (eachState of allStatesList) {
      const state = {
        stateId: eachState.state_id,
        stateName: eachState.state_name,
        population: eachState.population,
      };
      statesList.push(state);
    }
    return statesList;
  };
  const statesList = convertDbObjToResponseObj(allStatesList);
  response.send(statesList);
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
  let state = await db.get(getState);
  state = {
    stateId: state.state_id,
    stateName: state.state_name,
    population: state.population,
  };
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

  const addDistrictQuery = `
  INSERT INTO
  district
    (district_name,
    state_id,
    cases,
    cured,
    active,
    deaths)
    VALUES(
    "${districtName}",
    ${stateId},
    ${cases},
    ${cured},
    ${active},
    ${deaths}
    );
    `;
  const dbResponse = await db.run(addDistrictQuery);
  const districtId = dbResponse.lastId;
  response.send("District Successfully Added");
});

///API 4
app.get("/districts/:districtId/", async (request, response) => {
  let { districtId } = request.params;
  districtId = parseInt(districtId);

  const getDistrictQuery = `
    SELECT *
    FROM
    district
    WHERE
    district_id = ${districtId};
    `;
  const dbResponse = await db.get(getDistrictQuery);
  const district = {
    districtId: dbResponse.district_id,
    districtName: dbResponse.district_name,
    stateId: dbResponse.state_id,
    cases: dbResponse.cases,
    cured: dbResponse.cured,
    active: dbResponse.active,
    deaths: dbResponse.deaths,
  };

  response.send(district);
});

///API 5
app.delete("/districts/:districtId/", async (request, response) => {
  let { districtId } = request.params;
  districtId = parseInt(districtId);

  const deleteDistrictQuery = `
    DELETE
    FROM district
    WHERE
    district_id = ${districtId};
    `;
  await db.run(deleteDistrictQuery);
  response.send("District Removed");
});

///API 6
app.put("/districts/:districtId", async (request, response) => {
  const districtDetails = request.body;
  let { districtId } = request.params;
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
    district_name='${districtName}',
    state_id=${stateId},
    cases=${cases},
    cured=${cured},
    active=${active},
    deaths=${deaths}
    WHERE
    district_id = ${districtId};
  `;
  await db.run(updateDistrictQuery);
  response.send("District Details Updated");
});

///API 7
app.get("/states/:stateId/stats/", async (request, response) => {
  let { stateId } = request.params;
  stateId = parseInt(stateId);

  const getStateStats = `
    SELECT
    SUM(cases) AS totalCases,
     SUM(cured) AS totalCured,
     SUM(active) AS totalActive,
      SUM(deaths) AS totalDeaths
    FROM
    district
    WHERE state_id = ${stateId}
    GROUP BY state_id;
    `;
  const stateStats = await db.all(getStateStats);
  response.send(stateStats[0]);
});

//API 8
app.get("/districts/:districtId/details/", async (request, response) => {
  let { districtId } = request.params;
  districtId = parseInt(districtId);

  const getStateOfADistrictQuery = `
    SELECT
    state_name
    FROM
    state
    WHERE
    state_id = (
        SELECT state_id
        FROM district
        WHERE 
        district_id = ${districtId}
    );`;
  const dbResponse = await db.get(getStateOfADistrictQuery);
  const state = {
    stateName: dbResponse.state_name,
  };
  response.send(state);
});

module.exports = app;
