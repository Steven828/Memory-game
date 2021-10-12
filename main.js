const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished'
}

const Symbols = [
'https://image.flaticon.com/icons/svg/105/105223.svg', //黑桃
'https://image.flaticon.com/icons/svg/105/105220.svg', //愛心
'https://image.flaticon.com/icons/svg/105/105212.svg', //方塊
'https://image.flaticon.com/icons/svg/105/105219.svg'  //梅花
]

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length -1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

const view = {
  getCardElement(index) {
    return `<div data-index="${index}" class="card back"></div>
  </div>`
  },
  
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
      <p>${number}</p>
      <img src="${symbol}" alt="">
      <p>${number}</p>`
  },
  
  transformNumber(number) {
    switch(number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },
  
  flipCards(...cards) {
    cards.map(card => {
      //如果是背面，回傳正面
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      //如果是正面，回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },
  
  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },
  
  renderScore(score) {
    document.querySelector('.score').textContent = `Score: ${score}`
  },
  
  renderTriedTimes(times) {
    document.querySelector('.tried').textContent = `You've tried: ${times} times`
  },
  
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', e => {
        card.classList.remove('wrong')
      }, { once: true })
    })
  },
  
  showGameFinished () {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
    <p>Complete!</p>
    <p>Score: ${modal.score}</p>
    <p>You've tried: ${modal.times} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
  
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }
    
    switch(this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        modal.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++modal.triedTimes)
        view.flipCards(card)
        modal.revealedCards.push(card)
        if (modal.isRevealedCardsMatched()) {
          //配對成功
          view.renderScore(modal.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...modal.revealedCards)
          modal.revealedCards = []
          if (modal.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          //配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...modal.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
  },
  
  resetCards() {
    view.flipCards(...modal.revealedCards)
    modal.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}
controller.generateCards()

const modal = {
  revealedCards: [],
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },
  
  score: 0,
  
  triedTimes: 0
}
// Node List (array like)
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})