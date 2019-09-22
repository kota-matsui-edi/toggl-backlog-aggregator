/* eslint-disable camelcase */
declare module TogglApi {
  export namespace request {
    export type Billable = 'yes' | 'no' | 'both'
    export type TF = 'true' | 'false'
    export type OnOff = 'on' | 'off'
    export type DisplayHours = 'decimal' | 'minutes'
    export type Grouping = 'users' | 'projects'
    export type Calculate = 'time' | 'earnings'
    export interface Base {
      user_agent: string;
      workspace_id: string;
      since?: string;
      until?: string;
      billable?: Billable;
      client_ids?: string;
      project_ids?: string;
      user_ids?: string;
      members_of_group_ids?: string
      or_members_of_group_ids?: string
      tag_ids?: string
      task_ids?: string
      time_entry_ids?: string
      description?: string
      without_description?: TF
      order_field?: string
      order_desc?: OnOff
      distinct_rates?: OnOff
      rounding?: OnOff
      display_hours?: DisplayHours
    }
    export interface Weekly extends Base{
      grouping: Grouping
      calculate: Calculate
    }
    export interface Details extends Base {
      page?: number
    }

    export interface Summary extends Base {
      grouping: string
      subgrouping: string
      subgrouping_ids: boolean
      grouped_time_entry_ids: boolean
    }

  }

  export namespace responce{
    export interface TotalCurrency {
        currency?: string;
        amount?: number;
    }

    export interface DetailsDatum {
        id: number;
        pid: number;
        tid?: number;
        uid: number;
        description: string;
        start: Date;
        end: Date;
        updated: Date;
        dur: number;
        user: string;
        use_stop: boolean;
        client: string;
        project: string;
        task: string;
        billable: number;
        is_billable: boolean;
        cur: string;
        tags: string[];
    }

    export interface Base {
      total_grand: number;
      total_billable?: number;
      total_count: number;
      total_currencies: TotalCurrency[];
      data: any[];
    }

    export interface Details extends Base{
        per_page: number;
        data: DetailsDatum[];
    }
}

}
