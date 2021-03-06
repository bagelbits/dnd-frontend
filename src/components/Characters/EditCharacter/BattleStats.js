import React,{useState, useEffect, useContext } from 'react'
import {AttributeContext} from '../../../context/AttributeContext'
import {Context} from '../../../context/Context'
import axios from 'axios'
import DebounceInput from 'react-debounce-input'


export default function BattleStats({userClass, filteredLevel}) {
    const [currentHitPoints, setCurrentHitPoints] = useState(0)
    const {modMath} = useContext(AttributeContext)
    const {currentCharacter, setCurrentCharacter} = useContext(Context)
    const {dexterity, constitution, level, wisdom, job, race} = currentCharacter;
    let {currentHP} = currentCharacter;

    useEffect(()=>{
        setCurrentHitPoints(currentHP)
    },[currentHP])

    const calculateInitialAC = () => {
        switch(job.toLowerCase()) {
            case "monk":
                return modMath(dexterity) + modMath(wisdom) + 10;
            case "barbarian":
                return modMath(dexterity) + modMath(constitution) + 10;
            default:
                return modMath(dexterity) + 10;
        }
    }

    const calculateEquippedAC = (character) => {
        let equippedArmor = character.items.filter(item => item.isEquipped)

        let armorStats = (equippedArmor[0] || {armor_class:null}).armor_class
        if(character.items.length === 0 || !equippedArmor || !armorStats || !armorStats.base) {
            return calculateInitialAC()
        } else if(armorStats.dex_bonus) {
            if(!armorStats.max_bonus) {
                return armorStats.base + modMath(dexterity)
            } else {
                if(modMath(dexterity) > armorStats.max_bonus) {
                    return armorStats.base + armorStats.max_bonus
                } else {
                    return armorStats.base + modMath(dexterity)
                }
            }
        } else {
            return armorStats.base
        }
    }
 
    const averagetHitDie = (hitDie) => {
        return (hitDie/ 2) + 1
    }

    const calculateMaxHP = (character) => {
        return (averagetHitDie(userClass.hit_die) + modMath(character.constitution)) * level 
    }

    const calculateSpeed = (race, job) => {
        let speed
        let monkBonus
        if(race === "Gnome" || race ==="Halfling") { speed = 25}  
        else { speed = 30 }
        if(job === "Monk") { monkBonus = filteredLevel[0] ? filteredLevel[0].class_specific.unarmored_movement: 0 }  
        return speed + (monkBonus || 0)
    }

    const handleCurrentHpChange = (e) => {
        let hpValue = +e.target.value;
        setCurrentCharacter({...currentCharacter, currentHP: hpValue })
        submitToDb(hpValue);
    }
    
    const submitToDb = async (hp) => {
        try {
            const updateCharacterCurrentHP = {
                currentHP: hp
            }
            await axios.put(`https://dnd-backend-node.herokuapp.com/characters/${currentCharacter._id}`, updateCharacterCurrentHP, {headers: {"x-auth-token": localStorage.getItem('x-auth-token')}})
        } catch (err) {
            console.error(err)
        }
    } 

    return (
        <div className="battle-stats-container">
            <div>
                <p>Armor class: {calculateEquippedAC(currentCharacter)}</p>
                <p>Initiative: {modMath(dexterity)}</p>
                <p>Speed: {calculateSpeed(race , job)} feet</p>
            </div>
            <div>
                <p title="Initial Hit points are calculated by adding your Constitution Modifier and the average hit die value multiplied by your character's level or (HP = Level * (Hit Die average + CON modifier))">Max Hit Points: { calculateMaxHP(currentCharacter) }</p>
                <div>
                    <label>Current hit points: </label>
                    <DebounceInput
                        type="number"
                        max={calculateMaxHP(currentCharacter) || 0}
                        onChange={handleCurrentHpChange}
                        placeholder="Current Hp"
                        value={currentHitPoints || 0} />/{calculateMaxHP(currentCharacter)}
                </div>
            </div>
            <p>Hit Dice:  1d{userClass.hit_die}</p>

            <div className="death-saves">
                <label 
                title="If you're character's hit points are reduced to 0, you must roll 11 or higher on a d20 to succeed. If you roll a natural 20 you automatically get up with 1 hp">Successful Death Saves</label>
                <div>
                    <input type="checkbox"/>
                    <input type="checkbox"/>
                    <input type="checkbox"/>
                </div>
                <label title="If you're character's hit poitns are reduced to 0 roll a d20. If you roll 10 or below you have failed 1 death save. If you roll a natural 1 you have failed two death saves">Failed Death Saves</label>
                <div>
                    <input type="checkbox"/>
                    <input type="checkbox"/>
                    <input type="checkbox"/>
                </div>
            </div>
        </div>
    )
}
