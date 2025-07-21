import { useEffect, useState } from "react";
import { checkHeading, checkHeadingstars } from "../Helper";

const Answer = ({ ans ,totalResult, index}) => {
 
    const [isHeading, setIsHeading] = useState(false);
    const [answer, setAnswer] = useState(ans);


    useEffect(() => {

        const shouldBeHeading = checkHeading(ans);
        setIsHeading(shouldBeHeading);
        setAnswer(checkHeadingstars(ans));

    }, [answer,ans,index]);

  
    return (
        <div>
            {
             index ==0 && totalResult>1 ? <span className="pt=2 text-xl block text-white">{answer}</span> :
            
            isHeading? (
                <span className="pt-2 text-lg block text-white">{answer}</span>
            ) : (
                <span className="pl-5">{answer}</span>
            )}
        </div>
    );
}

export default Answer;