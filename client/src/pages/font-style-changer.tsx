import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

interface FontStyle {
  name: string;
  description: string;
  transform: (text: string) => string;
  example: string;
}

interface StyledText {
  style: string;
  text: string;
  original: string;
}

const FontStyleChanger = () => {
  const [inputText, setInputText] = useState('');
  const [styledTexts, setStyledTexts] = useState<StyledText[]>([]);
  const [textHistory, setTextHistory] = useState<StyledText[]>([]);

  // Unicode character mappings for different font styles
  const fontStyles: FontStyle[] = [
    {
      name: 'Bold',
      description: 'Mathematical bold characters',
      example: '𝐇𝐞𝐥𝐥𝐨 𝐖𝐨𝐫𝐥𝐝',
      transform: (text: string) => {
        const boldMap: { [key: string]: string } = {
          'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢',
          'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫',
          's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
          'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈',
          'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑',
          'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
          '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
        };
        return text.split('').map(char => boldMap[char] || char).join('');
      }
    },
    {
      name: 'Italic',
      description: 'Mathematical italic characters',
      example: '𝐻𝑒𝓁𝓁𝑜 𝒲𝑜𝓇𝓁𝒹',
      transform: (text: string) => {
        const italicMap: { [key: string]: string } = {
          'a': '𝒂', 'b': '𝒃', 'c': '𝒄', 'd': '𝒅', 'e': '𝒆', 'f': '𝒇', 'g': '𝒈', 'h': '𝒉', 'i': '𝒊',
          'j': '𝒋', 'k': '𝒌', 'l': '𝒍', 'm': '𝒎', 'n': '𝒏', 'o': '𝒐', 'p': '𝒑', 'q': '𝒒', 'r': '𝒓',
          's': '𝒔', 't': '𝒕', 'u': '𝒖', 'v': '𝒗', 'w': '𝒘', 'x': '𝒙', 'y': '𝒚', 'z': '𝒛',
          'A': '𝒜', 'B': '𝒷', 'C': '𝒞', 'D': '𝒟', 'E': '𝒠', 'F': '𝒻', 'G': '𝒢', 'H': '𝒽', 'I': '𝒾',
          'J': '𝒿', 'K': '𝒦', 'L': '𝒧', 'M': '𝒨', 'N': '𝒩', 'O': '𝒪', 'P': '𝒫', 'Q': '𝒬', 'R': '𝒭',
          'S': '𝒮', 'T': '𝒯', 'U': '𝒰', 'V': '𝒱', 'W': '𝒲', 'X': '𝒳', 'Y': '𝒴', 'Z': '𝒵'
        };
        return text.split('').map(char => italicMap[char] || char).join('');
      }
    },
    {
      name: 'Sans-Serif',
      description: 'Mathematical sans-serif characters',
      example: '𝖧𝖾𝗅𝗅𝗈 𝖶𝗈𝗋𝗅𝖽',
      transform: (text: string) => {
        const sansMap: { [key: string]: string } = {
          'a': '𝖺', 'b': '𝖻', 'c': '𝖼', 'd': '𝖽', 'e': '𝖾', 'f': '𝖿', 'g': '𝗀', 'h': '𝗁', 'i': '𝗂',
          'j': '𝗃', 'k': '𝗄', 'l': '𝗅', 'm': '𝗆', 'n': '𝗇', 'o': '𝗈', 'p': '𝗉', 'q': '𝗊', 'r': '𝗋',
          's': '𝗌', 't': '𝗍', 'u': '𝗎', 'v': '𝗏', 'w': '𝗐', 'x': '𝗑', 'y': '𝗒', 'z': '𝗓',
          'A': '𝖠', 'B': '𝖡', 'C': '𝖢', 'D': '𝖣', 'E': '𝖤', 'F': '𝖥', 'G': '𝖦', 'H': '𝖧', 'I': '𝖨',
          'J': '𝖩', 'K': '𝖪', 'L': '𝖫', 'M': '𝖬', 'N': '𝖭', 'O': '𝖮', 'P': '𝖯', 'Q': '𝖰', 'R': '𝖱',
          'S': '𝖲', 'T': '𝖳', 'U': '𝖴', 'V': '𝖵', 'W': '𝖶', 'X': '𝖷', 'Y': '𝖸', 'Z': '𝖹',
          '0': '𝟢', '1': '𝟣', '2': '𝟤', '3': '𝟥', '4': '𝟦', '5': '𝟧', '6': '𝟨', '7': '𝟩', '8': '𝟪', '9': '𝟫'
        };
        return text.split('').map(char => sansMap[char] || char).join('');
      }
    },
    {
      name: 'Monospace',
      description: 'Mathematical monospace characters',
      example: '𝙷𝚎𝚕𝚕𝚘 𝚆𝚘𝚛𝚕𝚍',
      transform: (text: string) => {
        const monoMap: { [key: string]: string } = {
          'a': '𝚊', 'b': '𝚋', 'c': '𝚌', 'd': '𝚍', 'e': '𝚎', 'f': '𝚏', 'g': '𝚐', 'h': '𝚑', 'i': '𝚒',
          'j': '𝚓', 'k': '𝚔', 'l': '𝚕', 'm': '𝚖', 'n': '𝚗', 'o': '𝚘', 'p': '𝚙', 'q': '𝚚', 'r': '𝚛',
          's': '𝚜', 't': '𝚝', 'u': '𝚞', 'v': '𝚟', 'w': '𝚠', 'x': '𝚡', 'y': '𝚢', 'z': '𝚣',
          'A': '𝙰', 'B': '𝙱', 'C': '𝙲', 'D': '𝙳', 'E': '𝙴', 'F': '𝙵', 'G': '𝙶', 'H': '𝙷', 'I': '𝙸',
          'J': '𝙹', 'K': '𝙺', 'L': '𝙻', 'M': '𝙼', 'N': '𝙽', 'O': '𝙾', 'P': '𝙿', 'Q': '𝚀', 'R': '𝚁',
          'S': '𝚂', 'T': '𝚃', 'U': '𝚄', 'V': '𝚅', 'W': '𝚆', 'X': '𝚇', 'Y': '𝚈', 'Z': '𝚉',
          '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿'
        };
        return text.split('').map(char => monoMap[char] || char).join('');
      }
    },
    {
      name: 'Double-Struck',
      description: 'Mathematical double-struck characters',
      example: 'ℍ𝕖𝕝𝕝𝕠 𝕎𝕠𝕣𝕝𝕕',
      transform: (text: string) => {
        const doubleMap: { [key: string]: string } = {
          'a': '𝕒', 'b': '𝕓', 'c': '𝕔', 'd': '𝕕', 'e': '𝕖', 'f': '𝕗', 'g': '𝕘', 'h': '𝕙', 'i': '𝕚',
          'j': '𝕛', 'k': '𝕜', 'l': '𝕝', 'm': '𝕞', 'n': '𝕟', 'o': '𝕠', 'p': '𝕡', 'q': '𝕢', 'r': '𝕣',
          's': '𝕤', 't': '𝕥', 'u': '𝕦', 'v': '𝕧', 'w': '𝕨', 'x': '𝕩', 'y': '𝕪', 'z': '𝕫',
          'A': '𝔸', 'B': '𝔹', 'C': 'ℂ', 'D': '𝔻', 'E': '𝔼', 'F': '𝔽', 'G': '𝔾', 'H': 'ℍ', 'I': '𝕀',
          'J': '𝕁', 'K': '𝕂', 'L': '𝕃', 'M': '𝕄', 'N': 'ℕ', 'O': '𝕆', 'P': 'ℙ', 'Q': 'ℚ', 'R': 'ℝ',
          'S': '𝕊', 'T': '𝕋', 'U': '𝕌', 'V': '𝕍', 'W': '𝕎', 'X': '𝕏', 'Y': '𝕐', 'Z': 'ℤ',
          '0': '𝟘', '1': '𝟙', '2': '𝟚', '3': '𝟛', '4': '𝟜', '5': '𝟝', '6': '𝟞', '7': '𝟟', '8': '𝟠', '9': '𝟡'
        };
        return text.split('').map(char => doubleMap[char] || char).join('');
      }
    },
    {
      name: 'Script',
      description: 'Mathematical script characters',
      example: '𝒽ℯ𝓁𝓁ℴ 𝓌ℴ𝓇𝓁𝒹',
      transform: (text: string) => {
        const scriptMap: { [key: string]: string } = {
          'a': '𝒶', 'b': '𝒷', 'c': '𝒸', 'd': '𝒹', 'e': 'ℯ', 'f': '𝒻', 'g': 'ℊ', 'h': '𝒽', 'i': '𝒾',
          'j': '𝒿', 'k': '𝓀', 'l': '𝓁', 'm': '𝓂', 'n': '𝓃', 'o': 'ℴ', 'p': '𝓅', 'q': '𝓆', 'r': '𝓇',
          's': '𝓈', 't': '𝓉', 'u': '𝓊', 'v': '𝓋', 'w': '𝓌', 'x': '𝓍', 'y': '𝓎', 'z': '𝓏',
          'A': '𝒜', 'B': 'ℬ', 'C': '𝒞', 'D': '𝒟', 'E': 'ℰ', 'F': 'ℱ', 'G': '𝒢', 'H': 'ℋ', 'I': 'ℐ',
          'J': '𝒥', 'K': '𝒦', 'L': 'ℒ', 'M': 'ℳ', 'N': '𝒩', 'O': '𝒪', 'P': '𝒫', 'Q': '𝒬', 'R': 'ℛ',
          'S': '𝒮', 'T': '𝒯', 'U': '𝒰', 'V': '𝒱', 'W': '𝒲', 'X': '𝒳', 'Y': '𝒴', 'Z': '𝒵'
        };
        return text.split('').map(char => scriptMap[char] || char).join('');
      }
    },
    {
      name: 'Fraktur',
      description: 'Mathematical fraktur characters',
      example: 'ℌ𝔢𝔩𝔩𝔬 𝔚𝔬𝔯𝔩𝔡',
      transform: (text: string) => {
        const frakturMap: { [key: string]: string } = {
          'a': '𝔞', 'b': '𝔟', 'c': '𝔠', 'd': '𝔡', 'e': '𝔢', 'f': '𝔣', 'g': '𝔤', 'h': '𝔥', 'i': '𝔦',
          'j': '𝔧', 'k': '𝔨', 'l': '𝔩', 'm': '𝔪', 'n': '𝔫', 'o': '𝔬', 'p': '𝔭', 'q': '𝔮', 'r': '𝔯',
          's': '𝔰', 't': '𝔱', 'u': '𝔲', 'v': '𝔳', 'w': '𝔴', 'x': '𝔵', 'y': '𝔶', 'z': '𝔷',
          'A': '𝔄', 'B': '𝔅', 'C': 'ℭ', 'D': '𝔇', 'E': '𝔈', 'F': '𝔉', 'G': '𝔊', 'H': 'ℌ', 'I': 'ℑ',
          'J': '𝔍', 'K': '𝔎', 'L': '𝔏', 'M': '𝔐', 'N': '𝔑', 'O': '𝔒', 'P': '𝔓', 'Q': '𝔔', 'R': 'ℜ',
          'S': '𝔖', 'T': '𝔗', 'U': '𝔘', 'V': '𝔙', 'W': '𝔚', 'X': '𝔛', 'Y': '𝔜', 'Z': 'ℨ'
        };
        return text.split('').map(char => frakturMap[char] || char).join('');
      }
    },
    {
      name: 'Circled',
      description: 'Characters enclosed in circles',
      example: 'Ⓗⓔⓛⓛⓞ Ⓦⓞⓡⓛⓓ',
      transform: (text: string) => {
        const circledMap: { [key: string]: string } = {
          'a': 'ⓐ', 'b': 'ⓑ', 'c': 'ⓒ', 'd': 'ⓓ', 'e': 'ⓔ', 'f': 'ⓕ', 'g': 'ⓖ', 'h': 'ⓗ', 'i': 'ⓘ',
          'j': 'ⓙ', 'k': 'ⓚ', 'l': 'ⓛ', 'm': 'ⓜ', 'n': 'ⓝ', 'o': 'ⓞ', 'p': 'ⓟ', 'q': 'ⓠ', 'r': 'ⓡ',
          's': 'ⓢ', 't': 'ⓣ', 'u': 'ⓤ', 'v': 'ⓥ', 'w': 'ⓦ', 'x': 'ⓧ', 'y': 'ⓨ', 'z': 'ⓩ',
          'A': 'Ⓐ', 'B': 'Ⓑ', 'C': 'Ⓒ', 'D': 'Ⓓ', 'E': 'Ⓔ', 'F': 'Ⓕ', 'G': 'Ⓖ', 'H': 'Ⓗ', 'I': 'Ⓘ',
          'J': 'Ⓙ', 'K': 'Ⓚ', 'L': 'Ⓛ', 'M': 'Ⓜ', 'N': 'Ⓝ', 'O': 'Ⓞ', 'P': 'Ⓟ', 'Q': 'Ⓠ', 'R': 'Ⓡ',
          'S': 'Ⓢ', 'T': 'Ⓣ', 'U': 'Ⓤ', 'V': 'Ⓥ', 'W': 'Ⓦ', 'X': 'Ⓧ', 'Y': 'Ⓨ', 'Z': 'Ⓩ',
          '0': '⓪', '1': '①', '2': '②', '3': '③', '4': '④', '5': '⑤', '6': '⑥', '7': '⑦', '8': '⑧', '9': '⑨'
        };
        return text.split('').map(char => circledMap[char] || char).join('');
      }
    },
    {
      name: 'Squared',
      description: 'Characters enclosed in squares',
      example: '🅷🅴🅻🅻🅾 🆆🅾🆁🅻🅳',
      transform: (text: string) => {
        const squaredMap: { [key: string]: string } = {
          'a': '🄰', 'b': '🄱', 'c': '🄲', 'd': '🄳', 'e': '🄴', 'f': '🄵', 'g': '🄶', 'h': '🄷', 'i': '🄸',
          'j': '🄹', 'k': '🄺', 'l': '🄻', 'm': '🄼', 'n': '🄽', 'o': '🄾', 'p': '🄿', 'q': '🅀', 'r': '🅁',
          's': '🅂', 't': '🅃', 'u': '🅄', 'v': '🅅', 'w': '🅆', 'x': '🅇', 'y': '🅈', 'z': '🅉',
          'A': '🅰', 'B': '🅱', 'C': '🅲', 'D': '🅳', 'E': '🅴', 'F': '🅵', 'G': '🅶', 'H': '🅷', 'I': '🅸',
          'J': '🅹', 'K': '🅺', 'L': '🅻', 'M': '🅼', 'N': '🅽', 'O': '🅾', 'P': '🅿', 'Q': '🆀', 'R': '🆁',
          'S': '🆂', 'T': '🆃', 'U': '🆄', 'V': '🆅', 'W': '🆆', 'X': '🆇', 'Y': '🆈', 'Z': '🆉'
        };
        return text.split('').map(char => squaredMap[char] || char).join('');
      }
    },
    {
      name: 'Fullwidth',
      description: 'Full-width characters',
      example: 'Ｈｅｌｌｏ　Ｗｏｒｌｄ',
      transform: (text: string) => {
        return text.split('').map(char => {
          const code = char.charCodeAt(0);
          if (code >= 33 && code <= 126) {
            return String.fromCharCode(code + 65248);
          } else if (code === 32) {
            return '　'; // Full-width space
          }
          return char;
        }).join('');
      }
    },
    {
      name: 'Upside Down',
      description: 'Upside-down text characters',
      example: 'pɹoM oʃʃǝH',
      transform: (text: string) => {
        const upsideMap: { [key: string]: string } = {
          'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ', 'h': 'ɥ', 'i': 'ᴉ',
          'j': 'ɾ', 'k': 'ʞ', 'l': 'ʃ', 'm': 'ɯ', 'n': 'u', 'o': 'o', 'p': 'd', 'q': 'b', 'r': 'ɹ',
          's': 's', 't': 'ʇ', 'u': 'n', 'v': 'ʌ', 'w': 'ʍ', 'x': 'x', 'y': 'ʎ', 'z': 'z',
          'A': '∀', 'B': 'ᗺ', 'C': 'Ɔ', 'D': 'ᗡ', 'E': 'Ǝ', 'F': 'ᖴ', 'G': 'פ', 'H': 'H', 'I': 'I',
          'J': 'ſ', 'K': 'ʞ', 'L': '˥', 'M': 'W', 'N': 'N', 'O': 'O', 'P': 'Ԁ', 'Q': 'Q', 'R': 'ᴿ',
          'S': 'S', 'T': '┴', 'U': '∩', 'V': 'Λ', 'W': 'M', 'X': 'X', 'Y': '⅄', 'Z': 'Z',
          '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6',
          '.': '˙', ',': "'", '?': '¿', '!': '¡', "'": ',', '"': '„', '&': '⅋', ';': '؛'
        };
        return text.split('').map(char => upsideMap[char] || char).reverse().join('');
      }
    },
    {
      name: 'Small Caps',
      description: 'Small capital letters',
      example: 'ʜᴇʟʟᴏ ᴡᴏʀʟᴅ',
      transform: (text: string) => {
        const smallCapsMap: { [key: string]: string } = {
          'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ꜰ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ',
          'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ',
          's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ',
          'A': 'ᴀ', 'B': 'ʙ', 'C': 'ᴄ', 'D': 'ᴅ', 'E': 'ᴇ', 'F': 'ꜰ', 'G': 'ɢ', 'H': 'ʜ', 'I': 'ɪ',
          'J': 'ᴊ', 'K': 'ᴋ', 'L': 'ʟ', 'M': 'ᴍ', 'N': 'ɴ', 'O': 'ᴏ', 'P': 'ᴘ', 'Q': 'ǫ', 'R': 'ʀ',
          'S': 's', 'T': 'ᴛ', 'U': 'ᴜ', 'V': 'ᴠ', 'W': 'ᴡ', 'X': 'x', 'Y': 'ʏ', 'Z': 'ᴢ'
        };
        return text.split('').map(char => smallCapsMap[char] || char).join('');
      }
    }
  ];

  const generateStyledTexts = () => {
    if (!inputText.trim()) {
      setStyledTexts([]);
      return;
    }

    const results: StyledText[] = fontStyles.map(style => ({
      style: style.name,
      text: style.transform(inputText),
      original: inputText
    }));

    setStyledTexts(results);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const addToHistory = (styledText: StyledText) => {
    setTextHistory(prev => {
      const updated = [styledText, ...prev.filter(t => !(t.text === styledText.text && t.style === styledText.style))];
      return updated.slice(0, 10);
    });
  };

  // Generate styled texts when input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generateStyledTexts();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [inputText]);

  // Initialize with sample text
  useEffect(() => {
    const sampleText = 'Hello World';
    setInputText(sampleText);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Font Style Changer - Transform Text with Stylish Fonts | DapsiWow</title>
        <meta name="description" content="Free font style changer and text generator. Transform text into stylish Unicode fonts including bold, italic, script, and fraktur. Perfect for social media, content creators, and messaging." />
        <meta name="keywords" content="font style changer, stylish text generator, Unicode font converter, fancy text maker, social media fonts, text styling tool, bold italic text, script font generator, content creator tools" />
        <meta property="og:title" content="Font Style Changer - Transform Text with Stylish Fonts" />
        <meta property="og:description" content="Free online font style changer. Transform plain text into stylish Unicode fonts for social media, content creation, and messaging. 12+ unique styles available." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/font-style-changer" />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-white py-16 pt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-font text-3xl"></i>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
              Font Style Changer
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Transform your text into stylish fonts using Unicode characters for social media and creative content
            </p>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What is a Font Style Changer?</h2>
              <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
                A font style changer is a powerful online tool that transforms regular text into stylized versions using Unicode characters. 
                Unlike traditional fonts that require installation, these Unicode-based font styles work universally across all platforms, 
                social media networks, and applications, making your text stand out instantly.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">How It Works</h3>
                <p className="text-gray-700">
                  Our font generator uses mathematical and decorative Unicode character sets to create the appearance of different fonts. 
                  Each style transforms your text using special Unicode symbols that display consistently across devices, 
                  from smartphones to computers, ensuring your styled text looks great everywhere.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">Key Features</h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• 12+ unique font styles including bold, italic, script</li>
                  <li>• Universal compatibility across all platforms</li>
                  <li>• Instant copy-and-paste functionality</li>
                  <li>• Real-time preview as you type</li>
                  <li>• History tracking for recently used styles</li>
                  <li>• No software installation required</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Generator Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Input Section */}
                  <div className="space-y-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Text Input</h2>
                    
                    <div className="space-y-6">
                      {/* Text Input */}
                      <div className="space-y-3">
                        <Label className="text-base font-medium">Enter Your Text</Label>
                        <Textarea
                          placeholder="Type your text here to see it transformed..."
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          className="min-h-[150px] resize-none text-lg"
                          data-testid="textarea-input-text"
                        />
                        <div className="text-sm text-gray-500">
                          {inputText.length} characters
                        </div>
                      </div>

                      {/* Clear Button */}
                      <Button 
                        onClick={() => setInputText('')}
                        variant="outline"
                        className="w-full"
                        data-testid="button-clear-text"
                      >
                        <i className="fas fa-eraser mr-2"></i>
                        Clear Text
                      </Button>
                    </div>
                  </div>

                  {/* Preview Section */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Font Styles Preview</h2>
                    
                    {!inputText.trim() ? (
                      <div className="text-center py-12 text-gray-400">
                        <i className="fas fa-font text-4xl mb-4"></i>
                        <p>Enter text to see styled previews</p>
                      </div>
                    ) : (
                      <div className="space-y-4" data-testid="styled-previews">
                        {fontStyles.map((style, index) => {
                          const styledText = style.transform(inputText);
                          return (
                            <div key={style.name} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <div className="font-medium text-gray-900">{style.name}</div>
                                  <div className="text-sm text-gray-500">{style.description}</div>
                                </div>
                                <Button
                                  onClick={() => {
                                    handleCopyToClipboard(styledText);
                                    addToHistory({ style: style.name, text: styledText, original: inputText });
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  data-testid={`button-copy-${index}`}
                                >
                                  <i className="fas fa-copy"></i>
                                </Button>
                              </div>
                              <div 
                                className="text-lg font-medium text-gray-900 break-words p-3 bg-white rounded border border-gray-200 cursor-pointer hover:bg-gray-50"
                                onClick={() => {
                                  handleCopyToClipboard(styledText);
                                  addToHistory({ style: style.name, text: styledText, original: inputText });
                                }}
                                data-testid={`styled-text-${index}`}
                              >
                                {styledText}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* History Section */}
                {textHistory.length > 0 && (
                  <>
                    <Separator className="my-8" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Recently Copied</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {textHistory.slice(0, 6).map((item, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{item.style}</div>
                                <div className="text-xs text-gray-500">Original: {item.original}</div>
                              </div>
                              <Button
                                onClick={() => handleCopyToClipboard(item.text)}
                                variant="ghost"
                                size="sm"
                                data-testid={`button-copy-history-${index}`}
                              >
                                <i className="fas fa-copy"></i>
                              </Button>
                            </div>
                            <div 
                              className="text-base text-gray-900 break-words cursor-pointer hover:text-blue-600"
                              onClick={() => handleCopyToClipboard(item.text)}
                              data-testid={`history-text-${index}`}
                            >
                              {item.text}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Benefits and Use Cases Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Who Uses Font Style Changers?</h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                From social media influencers to content creators, font style changers help professionals and individuals 
                across various fields make their text more engaging and visually appealing.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-900 mb-4">Content Creators & Bloggers</h3>
                <p className="text-blue-800 mb-4">
                  Essential for creating eye-catching headlines, social media posts, and blog titles that capture attention 
                  and increase engagement across platforms.
                </p>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Social media post styling</li>
                  <li>• Blog headline formatting</li>
                  <li>• YouTube video titles</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-green-900 mb-4">Students & Educators</h3>
                <p className="text-green-800 mb-4">
                  Perfect for making presentations, assignments, and educational materials more visually appealing 
                  and memorable for better learning outcomes.
                </p>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• Presentation headers</li>
                  <li>• Assignment titles</li>
                  <li>• Educational content styling</li>
                </ul>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-purple-900 mb-4">Social Media Managers</h3>
                <p className="text-purple-800 mb-4">
                  Crucial for creating branded content that stands out in crowded social feeds and maintains 
                  consistent visual identity across platforms.
                </p>
                <ul className="text-purple-700 text-sm space-y-1">
                  <li>• Brand consistency</li>
                  <li>• Campaign messaging</li>
                  <li>• Engagement optimization</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-orange-900 mb-4">Writers & Authors</h3>
                <p className="text-orange-800 mb-4">
                  Valuable for book promotions, article headlines, and creative writing projects that need 
                  distinctive formatting to capture reader interest.
                </p>
                <ul className="text-orange-700 text-sm space-y-1">
                  <li>• Book promotion materials</li>
                  <li>• Article formatting</li>
                  <li>• Creative writing projects</li>
                </ul>
              </div>
              
              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-red-900 mb-4">Business Professionals</h3>
                <p className="text-red-800 mb-4">
                  Useful for creating professional documents, presentations, and marketing materials 
                  that need to stand out in competitive business environments.
                </p>
                <ul className="text-red-700 text-sm space-y-1">
                  <li>• Marketing materials</li>
                  <li>• Professional presentations</li>
                  <li>• Business communications</li>
                </ul>
              </div>
              
              <div className="bg-teal-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-teal-900 mb-4">Gamers & Streamers</h3>
                <p className="text-teal-800 mb-4">
                  Essential for creating unique usernames, stream titles, and gaming content that 
                  helps build memorable online personas and brand recognition.
                </p>
                <ul className="text-teal-700 text-sm space-y-1">
                  <li>• Gaming usernames</li>
                  <li>• Stream overlays</li>
                  <li>• Community content</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Available Font Styles Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Explore Our Font Styles</h2>
              <p className="text-lg text-gray-700">
                Choose from over 12 unique Unicode font styles, each optimized for different purposes and platforms.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fontStyles.map((style, index) => (
                <div key={style.name} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{style.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{style.description}</p>
                  <div className="text-xl font-medium text-blue-600 mb-2">
                    {style.example}
                  </div>
                  <div className="text-xs text-gray-500">
                    Perfect for: {index < 3 ? 'Professional content' : index < 6 ? 'Creative projects' : index < 9 ? 'Social media' : 'Special occasions'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related Tools Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Text Enhancement Tools</h2>
              <p className="text-lg text-gray-700">
                Enhance your text processing workflow with our comprehensive suite of formatting and analysis tools.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <a href="/tools/case-converter" className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-text-height text-blue-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Case Converter</h3>
                <p className="text-gray-600 text-sm">
                  Transform text between uppercase, lowercase, title case, and sentence case for consistent formatting.
                </p>
              </a>
              
              <a href="/tools/character-counter" className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-calculator text-green-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Character Counter</h3>
                <p className="text-gray-600 text-sm">
                  Count characters, words, and sentences with detailed statistics for content optimization.
                </p>
              </a>
              
              <a href="/tools/word-counter" className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-file-text text-purple-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Word Counter</h3>
                <p className="text-gray-600 text-sm">
                  Analyze text length, reading time, and keyword density for content optimization.
                </p>
              </a>
              
              <a href="/tools/reverse-text-tool" className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-undo text-orange-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reverse Text Tool</h3>
                <p className="text-gray-600 text-sm">
                  Reverse text character by character or word by word for creative content and puzzles.
                </p>
              </a>
              
              <a href="/tools/lorem-ipsum-generator" className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-file-alt text-red-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Lorem Ipsum Generator</h3>
                <p className="text-gray-600 text-sm">
                  Generate placeholder text for design mockups, content templates, and development projects.
                </p>
              </a>
              
              <a href="/tools/text-to-binary-converter" className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-code text-teal-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Text to Binary Converter</h3>
                <p className="text-gray-600 text-sm">
                  Convert text to binary code for programming, data encoding, and technical applications.
                </p>
              </a>
            </div>
            
            <div className="text-center mt-12">
              <a href="/tools/text-tools" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                View All Text Tools
                <i className="fas fa-arrow-right ml-2"></i>
              </a>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            </div>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Do these font styles work on all platforms?</h3>
                <p className="text-gray-700">
                  Yes! Our font styles use Unicode characters that are universally supported across all platforms, 
                  operating systems, and applications. Whether you're using iOS, Android, Windows, Mac, or any web browser, 
                  the styled text will display correctly on social media, messaging apps, and websites.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">How do I copy and use the styled text?</h3>
                <p className="text-gray-700">
                  Simply click on any styled text variation to automatically copy it to your clipboard. Then paste it 
                  anywhere you want to use it - in social media posts, messages, documents, or websites. The styling 
                  will be preserved because these are special Unicode characters, not regular fonts.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Are there limitations with certain characters?</h3>
                <p className="text-gray-700">
                  Some Unicode character sets may not include every symbol, number, or special character. The availability 
                  of punctuation and numbers varies by style. However, all styles support standard English letters and 
                  most common symbols. You can test different characters to see which styles work best for your content.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Can I combine different font styles in one text?</h3>
                <p className="text-gray-700">
                  Absolutely! You can copy different portions of your text in various styles and manually combine them 
                  to create unique, mixed-style content. Each character is independent, giving you complete creative 
                  control over how you style different parts of your text.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Will these fonts affect website performance?</h3>
                <p className="text-gray-700">
                  Unicode characters are treated as regular text by browsers and don't negatively impact website performance. 
                  However, use styled fonts strategically for headings and emphasis rather than entire paragraphs. 
                  The characters load instantly since they're part of Unicode, so there's no performance impact.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Master Font Styling: Complete Guide</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Applications</h3>
                  <p className="text-gray-700 mb-4">
                    Font style changers have become essential tools in digital marketing and content creation. Social media 
                    managers use styled fonts to increase post engagement by up to 40%, while content creators rely on 
                    distinctive text formatting to build brand recognition across platforms.
                  </p>
                  <p className="text-gray-700">
                    Business professionals leverage font styling for presentations, marketing materials, and digital 
                    communications that need to capture attention in competitive environments.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Creative Benefits</h3>
                  <p className="text-gray-700 mb-4">
                    Unicode font styling opens up endless creative possibilities without requiring graphic design software. 
                    Writers can emphasize key points, educators can make learning materials more engaging, and students 
                    can create visually appealing presentations and assignments.
                  </p>
                  <p className="text-gray-700">
                    The universal compatibility of Unicode ensures your styled content looks consistent across all devices 
                    and platforms, making it perfect for global communication and collaboration.
                  </p>
                </div>
              </div>
              
              <div className="mt-12 p-6 bg-blue-50 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-900 mb-4">Best Practices for Font Styling</h3>
                <ul className="text-blue-800 space-y-2">
                  <li>• Use styled fonts sparingly for maximum impact and readability</li>
                  <li>• Choose font styles that match your content's tone and purpose</li>
                  <li>• Test different styles to see which ones work best on your target platforms</li>
                  <li>• Maintain consistency in your font styling choices for brand recognition</li>
                  <li>• Consider your audience when selecting decorative vs. professional styles</li>
                </ul>
              </div>
              
              <div className="mt-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Enhance Your Content Creation Workflow</h3>
                <p className="text-gray-700 mb-6">
                  Maximize your content's impact by combining font styling with other text enhancement tools. After styling your text, 
                  use our <a href="/tools/character-counter" className="text-blue-600 hover:text-blue-800 font-medium">character counter</a> 
                  to ensure your content fits platform limits and optimize for engagement.
                </p>
                <p className="text-gray-700 mb-6">
                  For content creators working with multiple formats, pair the font changer with our <a href="/tools/case-converter" className="text-blue-600 hover:text-blue-800 font-medium">case converter</a> 
                  to ensure consistent capitalization, or use the <a href="/tools/word-counter" className="text-blue-600 hover:text-blue-800 font-medium">word counter</a> 
                  to analyze your content's readability and structure.
                </p>
                <p className="text-gray-700">
                  Need to create content templates? Our <a href="/tools/lorem-ipsum-generator" className="text-blue-600 hover:text-blue-800 font-medium">lorem ipsum generator</a> 
                  helps you design layouts with placeholder text, while the <a href="/tools/reverse-text-tool" className="text-blue-600 hover:text-blue-800 font-medium">reverse text tool</a> 
                  can add creative flair to your styled content.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default FontStyleChanger;