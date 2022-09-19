const axios = require("axios").default;
const prompt = require("prompt");

const environment = "mypurecloud.ie"; // Your Genesys Cloud CX environment (e.g. mypurecloud.com)
const clientId = ""; // Your Genesys Cloud CX org OAuth client id (e.g. a49ab989-0802-40a6-8c95-da1b6a44ecf1)
const clientSecret = ""; // Your Genesys Cloud CX org OAuth client secret (e.g. 4p5mgg6ooH80DNqRj2Xro51VtO87YyhgBe323TaVIVk)
const numGroups = 1000; // Number of groups to create

let token;

//#region Genesys Cloud Functions

const login = async () => {
  try {
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");

    const response = await axios({
      url: `https://login.${environment}/oauth/token`,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(clientId + ":" + clientSecret).toString("base64")}`,
      },
      data: params,
    });
    console.log("Logged in!");
    token = response.data.access_token;
    return response;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};

const createGroups = async (groupPrefix) => {
  if (numGroups < 1) return;

  try {
    if (numGroups < 1) return;

    for (let index = 1; index < numGroups + 1; index++) {
      await createGroup(groupPrefix + index);
    }
  } catch (error) {
    console.error(error);
  }
};

const createGroup = async (groupName) => {
  try {
    const response = await axios({
      url: `https://api.${environment}/api/v2/groups`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${token}`,
      },
      data: {
        type: "official",
        name: groupName,
        rulesVisible: false,
        visibility: "public",
      },
    });
    console.log("Group created:", `${response.data.name} (${response.data.id})`);
    return response;
  } catch (error) {
    console.error("Error:", error.response.data.message);
  }
};

const getGroups = async (groupPrefix) => {
  try {
    let groups = [];
    let pageNumber = 1;
    let total = 0;

    console.log("Getting list of groups with prefix:", groupPrefix);
    while (true) {
      const response = await axios({
        url: `https://api.${environment}/api/v2/groups/search`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${token}`,
        },
        data: {
          pageNumber: pageNumber++,
          pageSize: 100,
          query: [
            {
              type: "STARTS_WITH",
              fields: ["name"],
              value: groupPrefix,
            },
          ],
        },
      });
      groups = groups.concat(response.data.results);
      total = response.data.total;
      if (pageNumber > response.data.pageCount) break;
    }
    console.log(`Found ${total} groups with prefix: ${groupPrefix}`);
    return groups || [];
  } catch (error) {
    console.error(error);
    console.error("Error:", error.response.data.message);
  }
};

const deleteGroup = async (groupId) => {
  try {
    await axios({
      url: `https://api.${environment}/api/v2/groups/${groupId}`,
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${token}`,
      },
    });
    // console.log(`Group ${groupId} deleted`);
  } catch (error) {
    console.error("Error:", error);
  }
};

axios.interceptors.response.use(null, async (error) => {
  // If 429, either try again with a new token or wait for 1 minute
  if (error.config && error.response && error.response.status === 429) {
    console.error(`Got 429 (Too Many Requests)... Waiting for 1 minute...`);
    await sleep(60000);
    return axios.request(error.config);
  } else {
    console.log(error.message);
  }
  return Promise.reject(error);
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

//#endregion

const main = () => {
  const cmdProperties = [
    {
      name: "createDelete",
      description: "Create or Delete groups? 0 to create, 1 to delete",
      required: true,
      type: "integer",
      default: 0,
      required: true,
    },
    {
      name: "groupPrefix",
      description: "Group Prefix (e.g. testgroup_)",
      required: true,
      type: "string",
      validator: /^[a-zA-Z_\s-]+$/,
      default: "testgroup_",
      warning: "Group Prefix must be only letters, spaces, or dashes",
    },
  ];

  prompt.start();

  prompt.get(cmdProperties, async (err, result) => {
    if (err) {
      return onErr(err);
    }

    console.log();
    console.log("Command-line input received:");
    console.log("  groupPrefix: " + result.groupPrefix);
    console.log("  createDelete: " + result.createDelete);
    console.log();

    await login();

    if (result.createDelete === 0) {
      await createGroups(result.groupPrefix);
    } else if (result.createDelete === 1) {
      const groups = await getGroups(result.groupPrefix);
      console.log("groups.length:", groups.length);
      for (let index = 0; index < groups.length; index++) {
        const group = groups[index];
        console.log(`Deleting group (${index + 1}/${groups.length})`);
        await deleteGroup(group.id);
      }
    }
  });

  function onErr(err) {
    console.error(err);
    return 1;
  }
};

main();
