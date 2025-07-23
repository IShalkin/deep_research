<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'

// Reactive data
const searchQuery = ref('')
const searchResults = ref([])
const searchHistory = ref([])
const isLoading = ref(false)
const error = ref('')
const currentFact = ref('')
const factIndex = ref(0)
const resultsDiv = ref(null)

// Local API endpoint (proxies to n8n webhook)
const API_URL = '/api/search'

// Interesting random facts for loading state
const researchFacts = [
  "🧠 The human brain processes visual information 60,000 times faster than text!",
  "🌍 Google processes over 8.5 billion searches per day worldwide.",
  "📚 The average person reads only 20% of a webpage before moving on.",
  "🔬 It takes about 50 milliseconds for users to form an opinion about a website.",
  "💡 The first computer bug was an actual bug - a moth trapped in a Harvard computer in 1947.",
  "🌐 There are over 1.7 billion websites on the internet, but only 200 million are active.",
  "⚡ Your smartphone has more computing power than NASA used to land on the moon.",
  "🎯 The average attention span has decreased from 12 seconds in 2000 to 8 seconds today.",
  "📊 90% of the world's data was created in the last two years alone.",
  "🚀 The internet weighs about the same as a strawberry (50 grams) due to electron movement.",
  "🔍 The word 'Google' was originally a misspelling of 'Googol' (10^100).",
  "💻 The first website ever created is still online: info.cern.ch",
  "🎨 Colors can increase brand recognition by up to 80%.",
  "📱 People check their phones an average of 96 times per day.",
  "🧬 Your DNA contains about 3 billion base pairs of information.",
  "🌟 A single Google search uses about 0.2 grams of CO2.",
  "🎵 Spotify has over 100 million songs in its database.",
  "🔐 The most common password is still '123456'.",
  "🌊 Netflix accounts for 15% of global internet traffic.",
  "🎮 The gaming industry is worth more than movies and music combined.",
  "🚗 Tesla's autopilot processes 40 times more data than the human brain.",
  "🌙 The Apollo 11 computer had less processing power than a calculator.",
  "📸 Instagram users upload 95 million photos per day.",
  "🎬 YouTube has over 2 billion logged-in monthly users.",
  "🔊 Alexa can understand requests in over 10 languages.",
  "💰 Bitcoin uses more electricity than entire countries like Argentina.",
  "🌈 The human eye can distinguish about 10 million colors.",
  "🎪 TikTok users spend an average of 52 minutes per day on the app.",
  "🔬 CRISPR can edit genes with 99.9% accuracy.",
  "🌍 There are more possible chess games than atoms in the observable universe.",
  "🎯 Amazon's recommendation engine drives 35% of their sales.",
  "🚀 SpaceX has reduced rocket launch costs by 90%.",
  "🧮 The first computer weighed 30 tons and filled an entire room.",
  "🌐 The internet was originally called ARPANET.",
  "💡 LED lights use 75% less energy than incandescent bulbs.",
  "🎨 Adobe Photoshop was originally called 'Display'.",
  "📡 Satellites orbit Earth at speeds of 17,500 mph.",
  "🔋 A smartphone battery has more computing power than NASA in 1969.",
  "🌟 The Milky Way galaxy contains over 100 billion stars.",
  "🎵 Shazam can identify a song in just 3 seconds.",
  "🔍 Bing processes over 12 billion searches per month.",
  "🌊 Underwater internet cables carry 99% of international data.",
  "🎮 The first video game was created in 1958.",
  "🚗 Self-driving cars generate 4TB of data per day.",
  "🌙 It would take 9 years to walk to the moon.",
  "📸 The first digital camera was invented in 1975.",
  "🎬 The first YouTube video was uploaded on April 23, 2005.",
  "🔊 Sound travels at 343 meters per second in air.",
  "💰 The first online purchase was a Sting CD for $12.48.",
  "🌈 Rainbows are actually full circles, not arcs.",
  "🎪 The average person spends 7 years of their life on the internet.",
  "🔬 Quantum computers can solve certain problems exponentially faster.",
  "🌍 Earth receives 174 petawatts of solar energy daily.",
  "🎯 Machine learning algorithms can predict earthquakes with 85% accuracy.",
  "🚀 The International Space Station travels at 17,500 mph.",
  "🧮 The word 'algorithm' comes from a 9th-century Persian mathematician.",
  "🌐 The deep web is 500 times larger than the surface web.",
  "💡 Thomas Edison held 1,093 patents.",
  "🎨 The PNG image format was created to replace GIF.",
  "📡 GPS satellites need to account for Einstein's relativity to stay accurate.",
  "🔋 Lithium-ion batteries can be recharged over 1,000 times.",
  "🌟 Neutron stars are so dense that a teaspoon would weigh 6 billion tons.",
  "🎵 MP3 compression removes sounds humans can't hear anyway.",
  "🔍 The PageRank algorithm that powers Google was named after Larry Page.",
  "🌊 Fiber optic cables can transmit data at 70% the speed of light.",
  "🎮 The best-selling video game of all time is Minecraft.",
  "🚗 Electric cars have 90% fewer moving parts than gas cars.",
  "🌙 Moon dust smells like gunpowder according to astronauts.",
  "📸 The first photograph took 8 hours to expose.",
  "🎬 CGI was first used in movies in 1973.",
  "🔊 Dolby Atmos can create 3D sound with up to 128 audio tracks.",
  "💰 Cryptocurrency mining consumes 0.5% of global electricity.",
  "🌈 Polarized sunglasses work by blocking horizontal light waves.",
  "🎪 Virtual reality can trick your brain into feeling physical sensations.",
  "🔬 DNA storage could hold all of humanity's data in a space the size of a sugar cube.",
  "🌍 The internet backbone consists of just 400 underwater cables.",
  "🎯 AI can now generate art that sells for millions of dollars.",
  "🚀 Rocket fuel is mostly liquid oxygen and hydrogen.",
  "🧮 The first programming language was created in 1957.",
  "🌐 IPv6 can create 340 undecillion unique IP addresses.",
  "💡 Solar panels convert only 20% of sunlight into electricity.",
  "🎨 4K resolution has 4 times more pixels than 1080p.",
  "📡 Radio waves from Earth have traveled 100 light-years into space.",
  "🔋 Supercapacitors can charge in seconds but store less energy.",
  "🌟 Black holes can slow down time due to extreme gravity.",
  "🎵 Vinyl records are making a comeback despite being 140 years old.",
  "🔍 Search engines index over 130 trillion web pages.",
  "🌊 Tidal energy could power the entire world 5 times over.",
  "🎮 Esports tournaments now have prize pools exceeding $40 million.",
  "🚗 Autonomous vehicles use LIDAR, cameras, and radar simultaneously.",
  "🌙 The moon is moving away from Earth at 3.8 cm per year.",
  "📸 Digital cameras can now capture 1 billion frames per second.",
  "🎬 The first computer-animated movie was Toy Story in 1995.",
  "🔊 Noise-canceling headphones work by creating opposite sound waves.",
  "💰 The first Bitcoin transaction bought 2 pizzas for 10,000 BTC.",
  "🌈 Holograms store information in 3D using interference patterns.",
  "🎪 Augmented reality overlays digital information on the real world.",
  "🔬 Gene therapy can now cure previously incurable genetic diseases.",
  "🌍 Geothermal energy taps into Earth's core temperature of 6,000°C.",
  "🎯 Facial recognition can identify people with 99.97% accuracy.",
  "🚀 Ion drives can propel spacecraft for years using minimal fuel.",
  "🧮 Quantum entanglement allows instant communication across any distance.",
  "🌐 The internet processes 2.5 quintillion bytes of data daily.",
  "💡 Perovskite solar cells could reach 40% efficiency.",
  "🎨 NFTs use blockchain to prove digital ownership.",
  "📡 5G networks can theoretically reach speeds of 20 Gbps.",
  "🔋 Solid-state batteries could triple electric car range.",
  "🌟 The James Webb telescope can see 13.5 billion years into the past.",
  "🎵 Spatial audio creates 3D soundscapes using psychoacoustics."
]

let factInterval = null

// Function to start rotating facts
const startFactRotation = () => {
  factIndex.value = 0
  currentFact.value = researchFacts[0]
  
  factInterval = setInterval(() => {
    factIndex.value = (factIndex.value + 1) % researchFacts.length
    currentFact.value = researchFacts[factIndex.value]
  }, 4000) // Change fact every 4 seconds
}

// Function to stop rotating facts
const stopFactRotation = () => {
  if (factInterval) {
    clearInterval(factInterval)
    factInterval = null
  }
}

onMounted(() => {
  const savedHistory = localStorage.getItem('deepSearchHistory')
  if (savedHistory) {
    searchHistory.value = JSON.parse(savedHistory)
  }
})

watch(searchResults, () => {
  if (searchResults.value.length > 0) {
    nextTick(() => {
      if (resultsDiv.value) {
        const links = resultsDiv.value.querySelectorAll('.html-content a')
        links.forEach(link => {
          link.setAttribute('target', '_blank')
          link.setAttribute('rel', 'noopener noreferrer')
        })
      }
    })
  }
})

// Function to perform search
const performSearch = async (query) => {
  if (!query || !query.trim()) {
    error.value = 'Please enter a search query'
    return
  }
  searchQuery.value = query

  // Add to history
  if (query.trim()){
    const history = searchHistory.value.filter(item => item.toLowerCase() !== query.toLowerCase())
    history.unshift(query)
    searchHistory.value = history.slice(0, 10); // Limit history to 10 items
    localStorage.setItem('deepSearchHistory', JSON.stringify(searchHistory.value))
  }

  isLoading.value = true
  error.value = ''
  searchResults.value = []
  
  // Start rotating facts during loading
  startFactRotation()

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery.value
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    searchResults.value = data
  } catch (err) {
    error.value = `Search failed: ${err.message}`
    console.error('Search error:', err)
  } finally {
    isLoading.value = false
    stopFactRotation()
  }
}

// Function to perform search from history
const searchFromHistory = (item) => {
  searchQuery.value = item.query
  performSearch(item.query)
}

// Handle form submission
const handleSubmit = (event) => {
  event.preventDefault()
  performSearch(searchQuery.value)
}
</script>

<template>
  <div class="app">
    <div class="content-wrapper">
      <header class="header">
        <h1>Deep Research App</h1>
        <p class="subtitle">Good ol' shoe was here</p>
      </header>

      <main class="main">
        <!-- Search Form -->
        <form @submit="handleSubmit" class="search-form">
          <div class="search-container">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Enter your research query..."
              class="search-input"
              :disabled="isLoading"
            />
            <button
              type="submit"
              class="search-button"
              :disabled="isLoading || !searchQuery.trim()"
            >
              {{ isLoading ? 'Searching...' : 'Search' }}
            </button>
          </div>
        </form>

        <!-- Search History -->
        <div v-if="searchHistory.length > 0 && !isLoading" class="search-history">
          <h3 class="history-title">Recent Searches</h3>
          <ul class="history-list">
            <li
              v-for="item in searchHistory"
              :key="item"
              @click="searchFromHistory({ query: item })"
              class="history-item"
            >
              {{ item }}
            </li>
          </ul>
        </div>

        <!-- Loading State with Facts -->
        <div v-if="isLoading" class="loading">
          <div class="loading-content">
            <div class="spinner-container">
              <div class="spinner"></div>
              <div class="pulse-ring"></div>
            </div>
            <h3 class="loading-title">🔍 Deep Research in Progress...</h3>
            <p class="loading-subtitle">Analyzing data from multiple sources</p>
            
            <!-- Rotating Facts -->
            <div class="fact-container">
              <div class="fact-label">💡 Did you know?</div>
              <div class="fact-text" :key="factIndex">{{ currentFact }}</div>
            </div>
            
            <!-- Progress Dots -->
            <div class="progress-dots">
              <div class="dot" :class="{ active: true }"></div>
              <div class="dot" :class="{ active: true }"></div>
              <div class="dot" :class="{ active: true }"></div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-if="error" class="error">
          <p>{{ error }}</p>
        </div>

        <!-- Results -->
        <div v-if="searchResults.length > 0" class="results" ref="resultsDiv">
          <h2>Research Results</h2>
          <div
            v-for="(result, index) in searchResults"
            :key="index"
            class="result-item"
          >
            <!-- Display HTML output if available, otherwise markdown -->
            <div
              v-if="result.output_html && result.output_html.trim()"
              v-html="result.output_html"
              class="result-content html-content"
            ></div>
            <div
              v-else-if="result.output && result.output.trim()"
              class="result-content markdown-content"
              v-html="result.output.replace(/\\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')"
            ></div>
            <div v-else class="result-content">
              <p>No content available. Debug info:</p>
              <pre style="font-size: 0.8rem; background: #f5f5f5; padding: 1rem; border-radius: 4px;">{{ JSON.stringify(result, null, 2) }}</pre>
            </div>
          </div>
        </div>
    </main>
    </div>
  </div>
</template>

<style scoped>
.app {
  /* Fill the viewport */
  min-height: 100vh;

  /* Flexbox with vertical main-axis for reliable centering */
  display: flex;
  flex-direction: column;           /* make main-axis vertical   */
  justify-content: center;          /* center along main-axis    */
  align-items: center;              /* center along cross-axis   */

  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 1rem;
  box-sizing: border-box;
}

.content-wrapper {
  max-width: 1000px;
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  padding: 3rem;
  backdrop-filter: blur(10px);
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header h1 {
  font-size: 3rem;
  color: #ffffff;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  font-weight: 700;
  letter-spacing: -1px;
}

.subtitle {
  color: #e8f4fd;
  font-size: 1.2rem;
  font-weight: 300;
  opacity: 0.9;
}

.main {
  width: 100%;
}

.search-form {
  margin-bottom: 2rem;
}

.search-container {
  display: flex;
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.search-input {
  flex: 1;
  padding: 1.2rem 1.5rem;
  font-size: 1.1rem;
  border: none;
  border-radius: 15px;
  outline: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.search-input:focus {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

.search-input:disabled {
  background-color: rgba(248, 249, 250, 0.7);
  cursor: not-allowed;
}

.search-button {
  padding: 1.2rem 2.5rem;
  font-size: 1.1rem;
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
  font-weight: 600;
  box-shadow: 0 8px 25px rgba(238, 90, 36, 0.3);
}

.search-button:hover:not(:disabled) {
  background: linear-gradient(45deg, #ee5a24, #ff6b6b);
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(238, 90, 36, 0.4);
}

.search-button:disabled {
  background: rgba(189, 195, 199, 0.7);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  margin: 2rem 0;
}

.loading-content {
  max-width: 500px;
  margin: 0 auto;
}

.spinner-container {
  position: relative;
  display: inline-block;
  margin-bottom: 2rem;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.pulse-ring {
  position: absolute;
  top: -10px;
  left: -10px;
  width: 80px;
  height: 80px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.loading-title {
  color: #ffffff;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.loading-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  margin-bottom: 2rem;
}

.fact-container {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 15px;
  padding: 1.5rem;
  margin: 2rem 0;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.fact-label {
  color: #ffd700;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.fact-text {
  color: #ffffff;
  font-size: 1.1rem;
  line-height: 1.4;
  animation: fadeInUp 0.5s ease-out;
}

.progress-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  animation: dotPulse 1.5s ease-in-out infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes fadeInUp {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes dotPulse {
  0%, 60%, 100% { transform: scale(1); opacity: 0.4; }
  30% { transform: scale(1.2); opacity: 1; }
}

.search-history {
  margin: -1rem auto 2rem;
  max-width: 800px;
}

.history-title {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
  text-align: center;
}

.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
  justify-content: center;
}

.history-item {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.history-item:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.error {
  background-color: #fee;
  color: #c33;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin: 2rem 0;
}

.results {
  margin-top: 3rem;
}

.results h2 {
  color: #ffffff;
  margin-bottom: 2rem;
  font-size: 2rem;
  text-align: center;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  font-weight: 600;
}

.result-item {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 20px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.result-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 45px rgba(0,0,0,0.15);
}

.result-content {
  line-height: 1.7;
  color: #2c3e50;
}

.html-content {
  text-align: left;
  line-height: 1.8;
}

.html-content h1 {
  color: #2c3e50;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 2rem 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 3px solid #667eea;
}

.html-content h2 {
  color: #34495e;
  font-size: 1.4rem;
  font-weight: 600;
  margin: 1.5rem 0 1rem 0;
  padding-bottom: 0.3rem;
  border-bottom: 2px solid #764ba2;
}

.html-content h3 {
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 1.2rem 0 0.8rem 0;
}

.html-content p {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.html-content ul,
.html-content ol {
  margin-bottom: 1rem;
  padding-left: 2rem;
}

.html-content li {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.html-content a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  border-bottom: 1px solid transparent;
  transition: all 0.3s ease;
}

.html-content a:hover {
  color: #764ba2;
  border-bottom-color: #764ba2;
}

.html-content code {
  background-color: #f1f2f6;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  color: #e74c3c;
}

.html-content pre {
  background-color: #f1f2f6;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.html-content br {
  line-height: 1.5;
}

.markdown-content pre {
  background-color: #f1f2f6;
  padding: 1.5rem;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre-wrap;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
}

/* Responsive design */
@media (max-width: 768px) {
  .app {
    padding: 1rem;
  }
  
  .search-container {
    flex-direction: column;
  }
  
  .header h1 {
    font-size: 2rem;
  }
}
</style>

<style>
/* Global styles */
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  min-height: 100vh;
  overflow-x: hidden;
}

#app {
  width: 100%;
  min-height: 100vh;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>
