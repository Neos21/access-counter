import { Controller, Get, Query } from '@nestjs/common';

import { DbService } from './db.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly dbService: DbService
  ) { }
  
  @Get('test-page')
  public async testPage(@Query('id') id: string): Promise<string> {
    if(this.isEmpty(id)) return '<h1 style="color: #f00;">Error : The Query ID Is Empty</h1>';
    const numberId = Number(id);
    if(Number.isNaN(numberId)) return '<h1 style="color: #f00;">Error : The Query ID Is NaN</h1>';
    
    const site = await this.dbService.findOne(numberId);
    if(site == null) return '<h1 style="color: #f00;">The Site Of The ID Does Not Exist</h1>';
    
    return `
      <!DOCTYPE html>
      <html lang="ja">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Access Controller Test Page</title>
          <style>
            table {
              border-collapse: collapse;
            }
            th {
              padding: 0;
              text-align: left;
            }
            td {
              padding: 0;
              text-align: right;
            }
            img {
              vertical-align: bottom;
            }
          </style>
        </head>
        <body>
          <h1>Test Page : ID [${id}]</h1>
          <table>
            <caption><a href="${site.siteUrl}">${site.siteName}</a></caption>
            <tbody>
              <tr>
                <td colspan="2"><img src="/ct/total?id=${id}&amp;digit=8"></td>
              </tr>
              <tr>
                <th>今日</th>
                <td><img src="/ct/today?id=${id}&amp;digit=4"></td>
              </tr>
              <tr>
                <th>昨日</th>
                <td><img src="/ct/yesterday?id=${id}&amp;digit=4"></td>
              </tr>
            </tbody>
          </table>
          <p>
            <button type="button" id="count">Count</button>
            <button type="button" id="reload">Reload</button>
          </p>
          <script type="module">
            document.getElementById('count').addEventListener('click', () => {
              fetch('/ct/pv?id=${id}&referrer=' + (document.referrer ?? ''))
                .then(response => response.json())
                .then(json => console.log(json))
                .catch(error => console.error(error));
            });
            document.getElementById('reload').addEventListener('click', () => {
              location.reload();
            });
          </script>
        </body>
      </html>
    `;
  }
  
  private isEmpty(value: any): boolean {
    return value == null || String(value).trim() === '';
  }
}
