import React, { PureComponent } from "react";
import ShowDashboardTitle from "../../Components/Ui/ShowDashboardTitle";
import RankingTable from "../../Components/Ranking/RankingTable";

export default class Ranking extends PureComponent {
  render() {
    return (
      <div className="w-full h-full ">
        <ShowDashboardTitle>Ranking</ShowDashboardTitle>
        <h1 className="font-primary font-bold mb-4">
          Se muestra el ranking de participantes de la sesión
        </h1>
        <RankingTable />
      </div>
    );
  }
}
