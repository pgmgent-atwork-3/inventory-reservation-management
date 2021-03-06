import React from "react";
import styled from "styled-components";
import StyledButton from "../Button/StyledButton.style";
import { useNavigate } from "react-router-dom";
import { InfoDevice } from "../../interfaces";
import { useParams } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { UPDATE_RESERVATION } from "../../graphql/reservations";
import { UPDATE_DEVICE } from "../../graphql/devices";
import "dotenv/config";
const DeviceInfo: React.FC<InfoDevice> = ({ name, description, damages }) => {
  let navigate = useNavigate();
  let { id } = useParams();
  let dt = Date.now();

  const [UpdateReservation] = useMutation(UPDATE_RESERVATION, {
    onCompleted: (response: any) => {},
    onError: (error) => {
      console.log(`GRAPHQL ERROR: ${error.message}`);
    },
  });

  const [UpdateDevice] = useMutation(UPDATE_DEVICE, {
    onCompleted: (response: any) => {
      navigate(-1);
    },
    onError: (error) => {
      console.log(`GRAPHQL ERROR: ${error.message}`);
    },
  });

  const handleReturn = async () => {
    await UpdateReservation({
      variables: {
        id: id,
        reservationStateId: `${process.env.REACT_APP_RETURNED_STATE}`,
        end_date: dt,
      },
    });

    UpdateDevice({
      variables: {
        id: id,
        deviceStatusId: `${process.env.REACT_APP_DEVICE_STATUS_INCHECK}`,
        userId: null,
      },
    });
  };
  return (
    <Wrapper>
      <div className="topic">
        <h2>{name}</h2>
        <h6>{id}</h6>
      </div>
      <div className="desc">
        <h4>Description</h4>
        <p>{description}</p>
      </div>
      <div className="extra">
        <div className="speces">
          <h4>Damages</h4>
          <ul>
            {damages.map((damage, index) => (
              <li key={index} className="spec">
                {damage.title}: {damage.description}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="btns">
        <StyledButton
          type="button"
          text="Cancel"
          color="white"
          width="48%"
          backgroundcolor="#ED1534"
          radius=".25rem"
          onClick={() => navigate(-1)}
        />
        <StyledButton
          type="button"
          text="Return"
          color="white"
          width="48%"
          backgroundcolor="#F58732"
          radius=".25rem"
          onClick={() => {
            if (
              window.confirm(
                `Confirm Returning This Device:  \nName : "${name}"  \nId: "${id}"`
              )
            ) {
              handleReturn();
            }
          }}
        />
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.div`
    width: 100%;
    & .topic{
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      margin-bottom: 16px;

      & h2{
        font-size:21px;
        font-weight: 700;
        color: #000;
        margin-bottom:8px;

      }
      & h6{
        font-size:16px;
        font-weight:400;
        color: #2E3939;
        font-style: italic;
      }
    }

    & .desc{
      margin-bottom: 12px;
      & h4{
        font-size:18px;
        font-weight:600;
        color: #2E3939;
        margin-bottom:8px;
      }
      & p{
        color:#859593;
        font-size:16px;
        font-weight: 600;
        line-height:1.5;
      
      }
    }

    & .extra{
      margin-bottom: 32px;

      & .speces{
        width: 100%;

      }
      & h4{
        font-size:18px;
        font-weight:600;
        color: #2E3939;
        margin-bottom:8px;
      }
      & ul{
        & .spec
          color:#859593;
          font-size:16px;
          margin-bottom:4px;
        }
        & .spec{
          font-weight:600;
          font-style: normal;
        }
      }

    }
    & .btns{

      margin-left:0;
      justify-content:center;
      width: 100%;
      display:flex;
      flex-direction: column-reverse;
      align-items: center;
      @media(min-width:1023px){
        flex-direction: row;
        margin-left: -8px;
      }
    }

    
    @media(min-width:1023px){
    width: 48%;
    }
`;

export default DeviceInfo;
