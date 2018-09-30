const STATES = {
  UNFLIPPED: 'unflipped',
  FLIPPING: 'flipping',
  FLIPPED: 'flipped'
}
const STATE_VALUES = Object.values(STATES)
const UPSIDE_DOWN_LOOKUP = {
  a: '\u0250', b: 'q', c: '\u0254', d: 'p', e: '\u01DD', f: '\u025F', g: '\u0183', h: '\u0265', i: '\u0131', j: '\u027E',
  k: '\u029E', l: '\u05DF', m: '\u026F', n: 'u', o: 'o', p: 'd', q: 'b', r: '\u0279', s: 's', t: '\u0287', u: 'n', v: '\u028C', w: '\u028D', x: 'x', y: '\u028E',
  z: 'z', '.': '\u02D9', '?': '\u00BF', '!': '\u00A1', '\'': ',',
  '[': ']', '(': ')', '{': '}', ']': '[', ')': '(', '}': '{', '<': '>', '>': '<',
  '_': '\u203E', ';': '\u061B', '\u203F': '\u2040', '\u2045': '\u2046', '\u2234': '\u2235', '&': '\u214b', '\"': '\u201e', ',': '\'', ' ': ' ',
  '━': '─', '─': '━', '┬': '┻', '┻': '┬', ' ': ' ', '\u00A0': '\u00A0'
}

const FACES = {
  ANGRY: 'angry',
  NORMAL: 'normal',
  SLEEPY: 'sleepy',
  WATCHING: 'watching',
  NOPE: 'nope'
}
const FACE_VALUES = Object.values(FACES)
const FACE_DISPLAYS = {
  [FACES.ANGRY]: "ಠ益ಠ",
  [FACES.SLEEPY]: "‾ □ ‾",
  [FACES.WATCHING]: "‾ □ °",
  [FACES.NORMAL]: "° □ °",
  [FACES.NOPE]: "° □ °",
}

const getWordElement = () => document.getElementById('word')
const getBirdElement = () => document.getElementById('bird')
const getFaceElement = () => document.getElementById('face')
const getBirdContainerElement = () => document.getElementById("bird-row")
const getCopyButton = () => document.getElementById('copy-btn')
const getStateContainerElement = () => document.getElementById('bird-state-container')
const getCurrentState = () => [...getStateContainerElement().classList].find(c => STATE_VALUES.includes(c))
const setCurrentState = state => {
  const element = getStateContainerElement()
  const { classList } = element
  classList.remove(...STATE_VALUES)
  classList.add(state)
}

const getCurrentFace = () => [...getBirdElement().classList].find(c => FACE_VALUES.includes(c))

const setFace = face => {
  const birdElement = getBirdElement();
  birdElement.classList.remove(...FACE_VALUES)
  birdElement.classList.add(face)

  const faceElement = getFaceElement()
  faceElement.textContent = FACE_DISPLAYS[face]
}


const onBirdClick = () => {
  const currentState = getCurrentState()
  if (currentState === STATES.FLIPPED) {
    setCurrentState(STATES.UNFLIPPED)
    setFace(FACES.SLEEPY)
  } else if (currentState === STATES.UNFLIPPED) {
    setFace(FACES.NORMAL)
    setCurrentState(STATES.FLIPPING)
    setUrlParam()
    setTimeout(() => {
      setCurrentState(STATES.FLIPPED)
    }, 600)
  }
}

const setPadding = () => {
  const wordSpan = getWordElement();
  const padding = (wordSpan.clientWidth) - wordSpan.clientHeight
  getBirdContainerElement().style.paddingTop = padding
}

const setText = () => {
  const text = getWordElement().innerText
  const splitText = text.split('')
  const upsideDownText = splitText.map(c => UPSIDE_DOWN_LOOKUP[c]).reverse().join('')
  const textOutputs = [...document.getElementsByClassName('upside-down')];
  textOutputs.forEach(el => el.textContent = upsideDownText)

  setPadding()
}

const wakeTheBird = () => {
  if (getCurrentFace() === FACES.SLEEPY) {
    setFace(FACES.WATCHING)
    setTimeout(() => {
      if (getCurrentState() === STATES.UNFLIPPED) {
        setFace(FACES.SLEEPY)
      }
    }, 1000);
  }
}

const shakeTheBird = () => {
  const currentFace = getCurrentFace();
  if (currentFace === FACES.SLEEPY || currentFace === FACES.WATCHING) {
    setFace(FACES.NOPE)
    setTimeout(() => {
      if (getCurrentFace() === FACES.NOPE) {
        setFace(FACES.SLEEPY)
      }
    }, 500)
  }
}


const onInput = () => {
  setText()
  wakeTheBird()
}

let interval;
const onmousedown = () => {
  setFace(FACES.NORMAL)
  clearInterval(interval);
  const currentState = getCurrentState()
  if (currentState === STATES.UNFLIPPED) {
    let duration = 1;
    interval = setInterval(() => {
      getBirdElement().style.animationDuration = `${duration /= 2}s`

      if (duration < 0.1) {
        clearInterval(interval)
        getBirdElement().style.animationDuration = '';
        if (getCurrentState() === STATES.UNFLIPPED) {
          setFace(FACES.ANGRY)
        }
      }
    }, 1000)
  }
}

const validateInput = input => {
  for (let char of input.split('')) {
    if (UPSIDE_DOWN_LOOKUP[char] === undefined) {
      shakeTheBird()
      return false
    }
  }
  return true
}

const validateKeyDown = event => event.keyCode !== 13 && (event.key.length > 1 || validateInput(event.key))

const validatePaste = event => {
  const text = (event.clipboardData || window.clipboardData).getData('text')
  return validateInput(text)
}

const onCopyClick = () => {
  window.getSelection().selectAllChildren(getBirdContainerElement());
  document.execCommand('copy')
}

const onUrlopen = () => {
  const searchParams = new URLSearchParams(window.location.search)
  const text = searchParams.get('text')

  if (text !== null && validateInput(text)) {
    getWordElement().textContent = text
  }
  setText()
}

const setUrlParam = () => {
  const text = getWordElement().innerText
  const searchParams = new URLSearchParams(window.location.search)
  if (searchParams.get('text') !== text) {
    searchParams.set('text', text)
    var newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();
    history.pushState(null, '', newRelativePathQuery);

  }
}


function run() {
  const bird = getBirdElement();
  bird.onclick = onBirdClick;
  bird.onmousedown = onmousedown

  document.body.onkeyup = e => e.keyCode === 13 && onBirdClick()

  const wordElement = getWordElement()
  wordElement.oninput = onInput
  wordElement.onkeydown = validateKeyDown
  wordElement.onpaste = validatePaste
  onUrlopen()
  setFace(FACES.SLEEPY)

  getCopyButton().onclick = onCopyClick
}

window.onload = run