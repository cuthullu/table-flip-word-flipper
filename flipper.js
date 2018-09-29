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
  NORMAL: 'normal'
}

const getWordElement = () => document.getElementById('word')
const getBirdElement = () => document.getElementById('bird')
const getFaceElement = () => document.getElementById('face')
const getBirdContainerElement = () => document.getElementById("bird-row")
const getCurrentState = () => [...getBirdContainerElement().classList].find(c => STATE_VALUES.includes(c))
const setCurrentState = state => {
  const { classList } = getBirdContainerElement()
  classList.remove(...STATE_VALUES)
  classList.add(state)
}
const setFace = face => {
  const faceElement = getFaceElement()
  faceElement.classList.remove(...Object.values(FACES))
  faceElement.classList.add(face)
}


const onBirdClick = () => {
  setFace(FACES.NORMAL)
  const currentState = getCurrentState()
  if (currentState === STATES.FLIPPED) {
    setCurrentState(STATES.UNFLIPPED)
  } else if (currentState === STATES.UNFLIPPED) {
    setCurrentState(STATES.FLIPPING)
    setTimeout(() => {
      setCurrentState(STATES.FLIPPED)
    }, 600)
  }
}

const setPadding = () => {
  const wordSpan = getWordElement();
  const padding = (wordSpan.clientWidth / 2) - wordSpan.clientHeight
  getBirdContainerElement().style.paddingTop = padding
}

const setText = () => {
  const text = getWordElement().innerText
  const splitText = text.split('')
  const upsideDownText = splitText.map(c => UPSIDE_DOWN_LOOKUP[c]).reverse().join('')
  const textOutputs = [...document.getElementsByClassName('upside-down')];
  textOutputs.forEach(el => el.textContent = upsideDownText)

  const filteredText = splitText.filter(c => !!UPSIDE_DOWN_LOOKUP[c]).join('')
  getWordElement().textContent = filteredText

  setPadding()
}

let interval;
const onmousedown = () => {
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
    if (UPSIDE_DOWN_LOOKUP[char] === undefined) return false
  }
  return true
}

const validateKeyDown = event => event.key.length > 1 || validateInput(event.key)

const validatePaste = event => {
  const text = (event.clipboardData || window.clipboardData).getData('text')
  return validateInput(text)
}


function run() {
  const bird = getBirdElement();
  bird.onclick = onBirdClick;
  bird.onmousedown = onmousedown

  document.body.onkeyup = e => e.keyCode === 13 && onBirdClick()
    
  const wordElement = getWordElement()
  wordElement.oninput = setText
  wordElement.onkeydown = validateKeyDown
  wordElement.onpaste = validatePaste
  setText()
}

window.onload = run