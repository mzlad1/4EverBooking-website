let isRefreshing = false; // Flag to track if token is being refreshed
let failedQueue = []; // Queue for failed requests during token refresh

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error); // Reject the request if there's an error
    } else {
      prom.resolve(token); // Resolve the request with the new token
    }
  });

  failedQueue = []; // Clear the queue after processing
};

// Helper function to refresh the access token
export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  console.log("Refresh Token:", refreshToken);

  try {
    // Call the refresh token API
    const response = await fetchWithAuth(
      "http://localhost:8080/auth/refresh-token",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${refreshToken}`,
          "Content-Type": "application/json", // Ensure this is included
          Accept: "*/*", // Match the curl request
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    // Parse the response and get new tokens
    const data = await response.json();
    const newAccessToken = data.access_token;
    const newRefreshToken = data.refresh_token;

    // Store new tokens in localStorage
    localStorage.setItem("accessToken", newAccessToken);
    localStorage.setItem("refreshToken", newRefreshToken);
    console.log("Token refreshed successfully");
    console.log("New access token:", newAccessToken);
    console.log("Refresh token:", newRefreshToken);

    return newAccessToken; // Return the new access token
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};

// Wrapper function around fetch to handle access token expiration and refresh token logic
// Utility to check whether the request has already been retried
const MAX_RETRY_ATTEMPTS = 1; // Only retry once after refreshing the token

export const fetchWithAuth = async (url, options = {}, retryAttempt = 0) => {
  let accessToken = localStorage.getItem("accessToken");

  // Attach the access token to the request headers
  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
  };

  try {
    // Make the initial API request
    const response = await fetch(url, options);

    // If the access token is expired (403 Forbidden) and this is the first retry
    if (response.status === 403 && retryAttempt < MAX_RETRY_ATTEMPTS) {
      if (!isRefreshing) {
        isRefreshing = true; // Only one refresh process should happen at a time

        try {
          // Attempt to refresh the access token
          const newAccessToken = await refreshAccessToken();
          processQueue(null, newAccessToken); // Process the queue with the new token
        } catch (error) {
          processQueue(error, null); // Process the queue with an error if refresh fails
          throw error;
        } finally {
          isRefreshing = false; // Reset the flag once refresh is done
        }
      }

      // Return a promise that waits for the token refresh to finish
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            // Retry the original request with the new access token, but only once
            options.headers["Authorization"] = `Bearer ${token}`;
            resolve(fetchWithAuth(url, options, retryAttempt + 1)); // Increment retryAttempt
          },
          reject: (error) => {
            reject(error);
          },
        });
      });
    }

    return response; // Return the original response if no 403 error
  } catch (error) {
    console.error("Error in API call:", error);
    throw error; // Handle or rethrow the error
  }
};
