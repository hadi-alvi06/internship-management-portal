import { FaTrashAlt } from "react-icons/fa";

export default function DeleteModal({

    deleteIntern,

    setDeleteIntern,

    handleDelete,

}){

    if(deleteIntern===null){

        return null;

    }

    return(

        <div className="modal-overlay">

            <div className="delete-modal">

                <div className="delete-icon">

                    <FaTrashAlt/>

                </div>

                <h2>

                    Delete Intern?

                </h2>

                <p>

                    This action cannot be undone.

                    <br/>

                    The selected intern will be permanently removed.

                </p>

                <div className="delete-buttons">

                    <button

                        className="cancel-btn"

                        onClick={()=>setDeleteIntern(null)}

                    >

                        Cancel

                    </button>

                    <button

                        className="confirm-delete-btn"

                        onClick={handleDelete}

                    >

                        Delete

                    </button>

                </div>

            </div>

        </div>

    );

}