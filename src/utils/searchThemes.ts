import { Themes } from "../types";

const themes: Themes = {
  defaultThemeId: 'halloween',
  themeList: [
    {
      id: 'halloween',
      name: 'Halloween',
      searchTerms: [
        'Black Lagoon',
        'Creature',
        'Dracula',
        'Elm Street',
        'Frankenstein',
        'Freddy Krueger',
        'Friday the 13th',
        'Halloween',
        'Horror',
        'Jason Vorhees',
        'Mummy',
        'Samhain',
        'Spooky',
        'Trick or treat',
        'Vampire',
        'Werewolf',
        'Wolfman',
      ]
    },
    {
      id: 'tmnt',
      name: 'Teenage Mutant Ninja Turtles',
      searchTerms: [
        'Ninja Turtles',
        'Teenage Mutant',
        'TMNT',
        'April O\'neil',
        'Casey Jones',
        'Master Splinter',
        'Krang',
        'Secret of the Ooze',
        'Mutants in Manhattan',
        'Shredder\'s Revenge',
        'Mutant Mayhem',
        'Turtles in Time',
        'Hyperstone Heist',
      ]
    }
  ]
}
export default themes;