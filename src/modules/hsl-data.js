import { fetchPostJson } from "./network";

const apiUrl = "https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql";

/**
 * @param {Number} latitude
 * @param {Number} longitude
 * @returns 5 Nearby Stops in 1500 meter radius from given coords
 */
const getNearbyStops = async (latitude, longitude) => {
  try {
    const query = `{
      nearest(lat: ${latitude}, lon: ${longitude}, maxResults: 5, maxDistance: 1500, filterByPlaceTypes: [STOP]) {
        edges {
          node {
              place {
                lat
                lon
                ...on Stop {
                  name
                  gtfsId
                  code
                }
              }
              distance
          }
        }
      }
    }`;

    return await fetchPostJson(apiUrl, "application/graphql", query);
  } catch (error) {
    console.log(error);
  }
};

const HSLData = { getNearbyStops };
export default HSLData;
