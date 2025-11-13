export interface RankDistribution {
  bronzeCount: number;
  silverCount: number;
  goldCount: number;

  bronzePercentage: number;
  silverPercentage: number;
  goldPercentage: number;
}

export interface CinemaStaffCount {
  cinemaId: string;
  managerCount: number;
  staffCount: number;
}

export interface UserStatsResponse {
  rankDistribution: RankDistribution;
  staffCounts: CinemaStaffCount[];
}
