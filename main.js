  /**********************************************************************
     * Joke Rating App
     * --------------------------------------------------------------------
     * This app fetches a random joke from icanhazdadjoke API and allows
     * users to rate it with a "Like" or "Dislike." The ratings (stored as
     * likes, dislikes, and overall score) are kept in local storage. A 
     * ranking table displays all rated jokes sorted by score in descending
     * order. Also, the app provides the functionality to export the data as a CSV file.
     **********************************************************************/
    
    // Global variable to hold the currently fetched joke object
    let currentJoke = null;
    
    // --------------------------------------------------
    // FETCH RANDOM JOKE FROM API
    // --------------------------------------------------
    async function fetchRandomJoke() {
      try {
        // Fetch random joke using Accept header for JSON response
        const response = await fetch("https://icanhazdadjoke.com/", {
          headers: { "Accept": "application/json" }
        });
        const data = await response.json();
        // Save the fetched joke as the current joke
        currentJoke = data;
        // Update the joke display area with the new joke text
        document.getElementById("jokeDisplay").textContent = data.joke;
        // Enable the rating buttons since a joke is now available
        document.getElementById("likeBtn").disabled = false;
        document.getElementById("dislikeBtn").disabled = false;
      } catch (error) {
        console.error("Error fetching joke:", error);
        document.getElementById("jokeDisplay").textContent = "Error loading joke. Please try again.";
      }
    }
    
    // --------------------------------------------------
    // EVENT LISTENER FOR "GET RANDOM JOKE" BUTTON
    // --------------------------------------------------
    document.getElementById("getJokeBtn").addEventListener("click", function() {
      // Disable rating buttons until a new joke is loaded
      document.getElementById("likeBtn").disabled = true;
      document.getElementById("dislikeBtn").disabled = true;
      // Fetch a new random joke
      fetchRandomJoke();
    });
    
    // --------------------------------------------------
    // LOCAL STORAGE HANDLING FUNCTIONS
    // --------------------------------------------------
    
    // Load joke ratings from local storage; return an object mapping joke IDs to data.
    function loadRatings() {
      const ratingsStr = localStorage.getItem("jokeRatings");
      return ratingsStr ? JSON.parse(ratingsStr) : {};
    }
    
    // Save the updated ratings object to local storage.
    function saveRatings(ratings) {
      localStorage.setItem("jokeRatings", JSON.stringify(ratings));
    }
    
    // --------------------------------------------------
    // UPDATE THE RANKING DISPLAY TABLE
    // --------------------------------------------------
    function updateRankingDisplay() {
      const ratings = loadRatings();
      // Convert the ratings object into an array for sorting and display.
      let ratingsArray = Object.keys(ratings).map(jokeId => {
        return {
          id: jokeId,
          joke: ratings[jokeId].joke,
          score: ratings[jokeId].score,
          likes: ratings[jokeId].likes,
          dislikes: ratings[jokeId].dislikes
        };
      });
      
      // Sort the array in descending order by score.
      ratingsArray.sort((a, b) => b.score - a.score);
      
      let html = "";
      if (ratingsArray.length === 0) {
        html = "<p>No jokes rated yet.</p>";
      } else {
        html += '<table class="table table-striped">';
        html += "<thead><tr><th>Joke</th><th>Likes</th><th>Dislikes</th><th>Score</th></tr></thead><tbody>";
        ratingsArray.forEach(item => {
          html += `<tr>
                     <td>${item.joke}</td>
                     <td>${item.likes}</td>
                     <td>${item.dislikes}</td>
                     <td>${item.score}</td>
                   </tr>`;
        });
        html += "</tbody></table>";
      }
      document.getElementById("rankingDisplay").innerHTML = html;
    }
    
    // --------------------------------------------------
    // HANDLE RATING ACTIONS (LIKE/DISLIKE)
    // --------------------------------------------------
    function rateJoke(type) {
      // If no current joke is loaded, do nothing.
      if (!currentJoke) return;
      
      // Load the current ratings from local storage.
      let ratings = loadRatings();
      const jokeId = currentJoke.id;
      
      // If this joke hasn't been rated before, initialize a record for it.
      if (!ratings[jokeId]) {
        ratings[jokeId] = { joke: currentJoke.joke, likes: 0, dislikes: 0, score: 0 };
      }
      
      // Update the record based on the rating type.
      if (type === "like") {
        ratings[jokeId].likes += 1;
        ratings[jokeId].score += 1;
      } else if (type === "dislike") {
        ratings[jokeId].dislikes += 1;
        ratings[jokeId].score -= 1;
      }
      
      // Save the updated ratings back to local storage.
      saveRatings(ratings);
      // Update the ranking display to reflect changes.
      updateRankingDisplay();
      
      // Disable rating buttons after voting to prevent multiple votes on the same joke.
      document.getElementById("likeBtn").disabled = true;
      document.getElementById("dislikeBtn").disabled = true;
    }
    
    // --------------------------------------------------
    // EVENT LISTENERS FOR RATING BUTTONS
    // --------------------------------------------------
    document.getElementById("likeBtn").addEventListener("click", function() {
      rateJoke("like");
    });
    document.getElementById("dislikeBtn").addEventListener("click", function() {
      rateJoke("dislike");
    });
    
    // --------------------------------------------------
    // RESET RATINGS FUNCTIONALITY
    // --------------------------------------------------
    document.getElementById("resetBtn").addEventListener("click", function() {
      if (confirm("Are you sure you want to reset all ratings?")) {
        localStorage.removeItem("jokeRatings");
        updateRankingDisplay();
      }
    });
    
    // --------------------------------------------------
    // EXPORT CSV FUNCTIONALITY
    // --------------------------------------------------
    // This function collects the rated jokes from local storage, creates a CSV string,
    // and triggers a download of the CSV file.
    function exportCSV() {
      const ratings = loadRatings();
      let csvContent = "data:text/csv;charset=utf-8,";
      // CSV header
      csvContent += "Joke ID,Joke,Likes,Dislikes,Score\n";
      
      // Loop over each rated joke and append a new CSV row
      Object.keys(ratings).forEach(jokeId => {
        const record = ratings[jokeId];
        // Replace double quotes in the joke text, and remove newlines
        const cleanedJoke = record.joke.replace(/"/g, '""').replace(/\r?\n|\r/g, " ");
        csvContent += `"${jokeId}","${cleanedJoke}",${record.likes},${record.dislikes},${record.score}\n`;
      });
      
      // Encode the CSV content and create a temporary download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "joke_ratings.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    document.getElementById("exportBtn").addEventListener("click", exportCSV);
    
    // --------------------------------------------------
    // INITIAL SETUP: Update ranking display on page load.
    // --------------------------------------------------
    updateRankingDisplay();
