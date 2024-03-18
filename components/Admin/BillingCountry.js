import CountrySelect from '../UI/CountrySelect'
import { useTranslation } from 'next-i18next'
import countries from "i18n-iso-countries"
import axios from 'axios'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

export default function BillingCountry({ billingCountry, setBillingCountry, choosingCountry, setChoosingCountry }) {

  const { i18n } = useTranslation()
  const router = useRouter()

  const [loading, setLoading] = useState(true) //keep true for country select

  let lang = i18n.language.slice(0, 2)
  const notSupportedLanguages = ['my'] // supported "en", "ru", "ja", "ko" etc
  if (notSupportedLanguages.includes(lang)) {
    lang = "en"
  }
  const languageData = require('i18n-iso-countries/langs/' + lang + '.json')
  countries.registerLocale(languageData)

  useEffect(() => {
    const sessionToken = localStorage.getItem('sessionToken')
    if (!sessionToken) {
      router.push('/admin')
    } else {
      axios.defaults.headers.common['Authorization'] = "Bearer " + sessionToken
      getApiData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getApiData = async () => {
    const partnerData = await axios.get(
      'partner/partner',
      { baseUrl: '/api/' }
    ).catch(error => {
      if (error && error.message !== "canceled") {
        console.log(error)
        if (error.response?.data?.error === "errors.token.required") {
          router.push('/admin')
        }
      }
      setLoading(false)
    })

    /*
    {
      "id": 321098,
      "created_at": "2022-09-20T12:42:38.000Z",
      "updated_at": "2024-01-09T12:08:33.000Z",
      "name": "vasia.com",
      "email": "sasha@public.com",
      "country": "GB"
    }
    */

    setLoading(false)

    const partnerCountry = partnerData?.data?.country

    //if we have country available: set country
    if (partnerCountry) {
      setBillingCountry(partnerCountry)
    } else {
      //if no country available
      setChoosingCountry(true)
    }
  }

  const saveCountry = async () => {
    const data = await axios.put(
      'partner/partner',
      { country: billingCountry },
      { baseUrl: '/api/' }
    ).catch(error => {
      if (error && error.message !== "canceled") {
        console.log(error)
      }
    })
    if (data?.data?.country) {
      setChoosingCountry(false)
    }
  }

  return <>
    {((!billingCountry || choosingCountry) && !loading) ?
      <>
        <h4>Choose your country of residence</h4>
        <CountrySelect
          countryCode={billingCountry}
          setCountryCode={setBillingCountry}
          type="onlySelect"
        />
        <br />
        <button
          onClick={() => saveCountry()}
          className='button-action'
        >
          Save
        </button>
        <br />
      </>
      :
      <>
        {billingCountry &&
          <>
            Your billing country is {" "}
            <a onClick={() => setChoosingCountry(true)}>
              {countries.getName(billingCountry, lang, { select: "official" })}
            </a>
          </>
        }
      </>
    }
  </>
}
