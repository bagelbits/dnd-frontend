import React,{useEffect, useContext } from 'react'
import {AttributeContext} from '../../../context/AttributeContext'
import {Context} from '../../../context/Context'


export default function Attributes({
    filteredLevel,
    }) {
    
    const {currentCharacter} = useContext(Context)


    const {
        modMath, 
        allAttributes, 
        sortFunction, 
        attributeValue, 
        handleAttributeValueChange, 
        setAttributeValue} = useContext(AttributeContext)
    
    const getAttributeValue = (attributeName) => attributeValue[attributeName];


    useEffect(()=>{
        setAttributeValue({
            STR: currentCharacter.strength,
            DEX: currentCharacter.dexterity, 
            CON: currentCharacter.constitution,
            INT: currentCharacter.intelligence,
            WIS: currentCharacter.wisdom,
            CHA: currentCharacter.charisma
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[currentCharacter])

    return (
        <div className="container">
            <div>
                Proficiency Bonus:{(filteredLevel[0] || []).prof_bonus}
            </div>
            {allAttributes.sort(sortFunction).map((attribute, i) =>{
                return (
                    <div className="attribute" key={i}>
                        <label>{attribute[0]}</label>
                        <input 
                            type="number"
                            min="3"
                            max="20"
                            name={attribute[0]}
                            value={attributeValue[attribute[0]] || 10}
                            onChange={(e) => handleAttributeValueChange({[e.target.name]: +e.target.value})}
                        />
                        <label>{`${attribute[0]} Mod`} {modMath(getAttributeValue(attribute[0]))}</label>
                    </div>
                )
            })}
        </div>
    )
}

