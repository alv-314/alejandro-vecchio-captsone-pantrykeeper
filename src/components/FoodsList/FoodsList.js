import './FoodsList.scss';
import { uuidv4 } from '@firebase/util';
import { useEffect, useState } from 'react';

//Cards
import ItemCard from '../Cards/ItemCard/ItemCard';
import NewItemCard from '../Cards/NewCard/NewCard';

//Modals
import NewFood from '../Modals/FoodsModals/NewFood/NewFood';
import FoodDetails from '../Modals/FoodsModals/FoodDetails/FoodDetails';

//Icons
import foodIcon from '../../assets/images/icons/nutrition.svg'
import deleteIcon from '../../assets/images/icons/delete.svg'
import axios from 'axios';
import { backend } from '../../firebase';
import { useParams } from 'react-router-dom';

const FoodsList = (props) => {
    const {id} = useParams();
    const {filterI, filterD} = props;

    const [food, setFood] = useState({});
    const [foods, setFoods] = useState([]);
    const [showNew, setShowNew] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [displayFood,  setDisplay] = useState([])
    
    useEffect(() =>{
        setDisplay(foods);
    }, [foods])
    
    useEffect(() => {
        axios.get(`${backend}/api/foods/${id}`)
        .then((res) => {
            setFoods(res.data);
        }).catch((e) => {
            console.log(e);
        })
    }, [id])

    //To the database.
    const handleNew = (e, addedFoods) => {
        e.preventDefault();
        //Post body 
        const foodPost = {
            foods: addedFoods,
        }
        //Axios call to add all foods. 
        axios.post(`${backend}/api/foods/${id}`, foodPost)
        .then( res => {
            //Close modal.
            setShowNew(false);
            setFoods([...res.data, ...foods])
        })
        .catch( error => {})
    }
    
    const handleDelete = (e, foodId) => {
        console.log(id);
        console.log(foodId);
        e.preventDefault();
        axios.delete(`${backend}/api/foods/${id}/${foodId}`)
        .then(res => {
            console.log(res)
            setFoods(foods.filter( food => food.food_id !== foodId));
        })
        .catch(err => console.log(err));    
    }
    //Filter the foods array without losing data.
    useEffect(() => {
        if (filterI && !filterD){
            setDisplay(foods.filter(food => food.food_type === "ingredient"))
        }else if (filterD && !filterI){
            setDisplay(foods.filter(food => food.food_type === "dish"))
        }else{
            setDisplay(foods)
        }
    }, [filterI, filterD])

    //Change the color of the card based on date.
    const daysSince = (date) =>{
        const today = new Date()
        const diff = today - date;
        const result = Math.ceil(diff / (1000 * 3600 * 24));
        return result - 1;
    }
    const changeColor = (timestamp) => {
        const days = daysSince(timestamp)
        if(days < 15){
            return "food-new";
        }else if(days < 32){
            return "food-stale";
        }else{
            return "food-old";
        }
    }

    return (
        <>  
            {showNew && <NewFood 
            show={showNew} 
            onClose = {() => setShowNew(false)}
            handleNew = {(e, addedFoods) => handleNew(e, addedFoods)}/>}
            {showDetails && food && <FoodDetails 
            show={showDetails} 
            food={food} 
            onClose={() => setShowDetails(false)}/>}

            <section className='foods'>
                <ul className='foods__list'>
                    {displayFood && displayFood.map((food) => {
                        return ( 
                        <li key={uuidv4()} className='foods__list-item'>
                            <ItemCard 
                            key={uuidv4()} 
                            itemName={food.food_name} 
                            icon ={foodIcon}
                            onClickDetail = {() => {
                                setFood(food);
                                setShowDetails(true);   
                            }}
                            additionalClass = {changeColor(food.timestamp)}
                            secondaryIcon = {deleteIcon}
                            onClickSecondary = {(e) => {setFood(food); handleDelete(e, food.food_id)}} 
                            />
                        </li>
                        )
                    })}
                    <li className='foods__list-item'>
                        <NewItemCard title={'Food'} onClickHandler = {() => setShowNew(true)}></NewItemCard>
                    </li>
                </ul>
            </section>
        </>
        
    )
}

export default FoodsList;