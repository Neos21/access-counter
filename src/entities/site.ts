import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** サイト別情報 */
@Entity('sites')
export class Site {
  /** ID */
  @PrimaryGeneratedColumn({ name: 'id' })
  public id: number;
  
  /** サイト名 (内部確認用・未使用) */
  @Column({ type: 'text', name: 'site_name' })
  public siteName: string;
  /** サイト URL (内部確認用・未使用) */
  @Column({ type: 'text', name: 'site_url' })
  public siteUrl: string;
  
  /** トータルアクセス数 */
  @Column({ type: 'integer', name: 'total', default: 0 })
  public total: number;
  /** 今日のアクセス数 */
  @Column({ type: 'integer', name: 'today', default: 0 })
  public today: number;
  /** 昨日のアクセス数 */
  @Column({ type: 'integer', name: 'yesterday', default: 0 })
  public yesterday: number;
  
  /** 登録日時 */
  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;
  /** 更新日時 */
  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date;
  
  constructor(partial: Partial<Site>) {
    Object.assign(this, partial);
  }
}
