import React, { Fragment, Component } from 'react';

import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity
} from 'react-native';

import stringSimilarity from 'string-similarity';

import Voice from '@react-native-community/voice';
import Sound from 'react-native-sound'


export default class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      textoStatus: 'Aguardando Próximo Ciclo',

      initialTime: 0,
      tempoReacao: 0,

      SOUND_TABLE: {
        'CTA': {
          'url': 'https://sndup.net/3d7s/CTA.wav',
          'time': 3
        },
        'FADIGA-1': {
          'url': 'https://sndup.net/9kg8/FADIGA.wav',
          'time': 6
        },
        'FADIGA-2': {
          'url': 'https://sndup.net/6pgd/FADIGA-2.wav',
          'time': 5
        },
        'FAMILIA': {
          'url': 'https://sndup.net/36hm/FAMILIA.wav',
          'time': 8
        },
        'PARAR': {
          'url': 'https://sndup.net/2p2v/PARAR.wav',
          'time': 3
        },
        'PIADA': {
          'url': 'https://sndup.net/534g/PIADA.wav',
          'time': 5
        }
      },

      playingSound: false
    }

    Voice.onSpeechStart = this.onSpeechStartHandler.bind(this);
    Voice.onSpeechEnd = this.onSpeechEndHandler.bind(this);
    Voice.onSpeechResults = this.onSpeechResultsHandler.bind(this);

  }

  componentDidMount() {
    this.checkFadigaEveryN(1)
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  checkFadigaEveryN = async (minute) => {
    const repeatTime = minute * 1000 * 60;

    setInterval(async () => {
      await this.playSound('CTA')
      await this.onStartButtonPress()
    }, 30 * 1000);


  }

  togglePlayingStatus = () => {
    this.setState((prevState) => ({
      playingSound: !prevState.playSound
    }));
  }

  playSound = async (type) => {
    console.log('[SOUND] PLAY')
    if (!this.state.playingSound) {
      this.setState({ playingSound: true })

      let soundData = this.state.SOUND_TABLE[type]
      let waitTime = (soundData.time + 2)
      let sound = new Sound(soundData.url, null, () => sound.play());
      await this.sleep(waitTime * 1000)

      this.setState({
        initialTime: Date.now()
      })

      this.setState({ playingSound: false })
    }
  }

  checkCTAPhrase = (targetPhrase, phraseArray) => {
    let results = phraseArray.value
    let bestMatch = stringSimilarity.findBestMatch(targetPhrase, results).bestMatch;
    let bestRating = bestMatch.rating;
    return bestRating;
  }


  onSpeechResultsHandler = async (result) => {
    const targetPhrase = 'Na Escuta'
    let confidence = this.checkCTAPhrase(targetPhrase.toLowerCase(), result)
    let textoStatus = ''

    const TEMPO_FADIGA = 1.5 + 2

    if (confidence >= 0.70) {
      await this.playSound('FADIGA-1')
    }
    if (confidence < 0.7 || this.state.tempoReacao >= TEMPO_FADIGA * 1000) {
      await this.playSound('PARAR')
    }

    this.setState({ textoStatus })

  }

  onSpeechStartHandler() {
    this.setState({
      textoStatus: 'Fale com o CHaPA'
    });
  }

  onSpeechEndHandler = async () => {
    let tempoResposta = Date.now() - this.state.initialTime;
    Voice.stop();
    this.setState({ textoStatus: 'Aguardando o Próximo Ciclo', tempoReacao: tempoResposta });
  }

  onStartButtonPress = async () => {
    console.log('[VOICE] SPEAK')
    await Voice.start('pt-BR');
  }

  render() {
    return (
      <Fragment>
        <View style={styles.container}>
          <Text style={[styles.rectangleText, {color:'#3a3a3a'}]}>{this.state.textoStatus}</Text>
          <View style={styles.rectangle}>
            <Text style={styles.rectangleText}>334,8 Km percorridos</Text>
          </View>
          <View style={styles.rectangle}>
            <Text style={styles.rectangleText}>em 5h 25min</Text>
          </View>

          <TouchableOpacity style={styles.rectangleBtn}>
            <Text style={styles.rectangleText}>Encerrar Rota</Text>
          </TouchableOpacity>

        </View >
      </Fragment >
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d7d6d9',
    justifyContent: 'center'

  },
  rectangleText: {
    color: 'white',
    fontSize: 24,
    fontFamily: 'Arial',
    alignSelf: 'center'
  },
  rectangle: {
    marginTop: 20,
    width: '80%',
    height: 70,
    backgroundColor: '#3a3a3a',
    alignSelf: 'center',
    justifyContent: 'center'
  },
  rectangleBtn: {
    marginTop: 20,
    width: '80%',
    height: 80,
    backgroundColor: '#e60049',
    alignSelf: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  button: {
    alignSelf: 'center',
    backgroundColor: 'blue'
  },
  welcome: {
    fontSize: 25,
    alignSelf: 'center',
    margin: 40,
  },
});
